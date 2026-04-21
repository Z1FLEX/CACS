package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessDecisionReasonCode;
import com.hsware.cacs.dto.AccessDecisionType;
import com.hsware.cacs.dto.AccessSwipeRequestDTO;
import com.hsware.cacs.dto.AccessSwipeResponseDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.entity.AccessLog;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.entity.Profile;
import com.hsware.cacs.entity.Schedule;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.AccessLogRepository;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccessDecisionService {

    private final DeviceRepository deviceRepository;
    private final AccessCardRepository accessCardRepository;
    private final UserRepository userRepository;
    private final AccessLogRepository accessLogRepository;
    private final ScheduleEvaluationService scheduleEvaluationService;
    private final CardEnrollmentService cardEnrollmentService;

    @Transactional
    public AccessSwipeResponseDTO evaluateSwipe(AccessSwipeRequestDTO request) {
        Instant occurredAt = request.getOccurredAt() != null ? request.getOccurredAt() : Instant.now();
        String normalizedCardUid = request.getCardUid().trim();
        String cardHash = CardHashingService.sha256(normalizedCardUid);

        if (cardEnrollmentService.isEnrollmentActive()) {
            cardEnrollmentService.captureEnrollmentUid(normalizedCardUid);
            return new AccessSwipeResponseDTO(
                false,
                AccessDecisionType.INTERCEPTED,
                AccessDecisionReasonCode.ENROLLMENT_CAPTURED,
                "Card captured for enrollment",
                request.getDeviceId(),
                request.getDoorId(),
                null,
                null,
                normalizedCardUid,
                occurredAt
            );
        }

        Device device = deviceRepository.findWithDoorsAndZonesByIdAndDeletedAtIsNull(request.getDeviceId())
            .orElse(null);
        if (device == null) {
            return deny(request, occurredAt, AccessDecisionReasonCode.DEVICE_NOT_FOUND, "Device not found");
        }

        if (!"ONLINE".equalsIgnoreCase(device.getStatus())) {
            return deny(request, occurredAt, AccessDecisionReasonCode.DEVICE_OFFLINE, "Device is offline");
        }

        Door door = device.getDoors().stream()
            .filter(candidate -> candidate.getId() != null && candidate.getId().equals(request.getDoorId()))
            .findFirst()
            .orElse(null);
        if (door == null) {
            return deny(request, occurredAt, AccessDecisionReasonCode.DOOR_NOT_LINKED_TO_DEVICE, "Door is not linked to device");
        }

        Zone zone = door.getZone();
        if (zone == null || zone.getDeletedAt() != null) {
            return deny(request, occurredAt, AccessDecisionReasonCode.DOOR_ZONE_MISSING, "Door does not have an active zone");
        }

        AccessCard card = accessCardRepository.findByNumAndDeletedAtIsNull(cardHash)
            .orElse(null);
        if (card == null) {
            return deny(request, occurredAt, AccessDecisionReasonCode.CARD_NOT_FOUND, "Card not found");
        }

        if ("REVOKED".equalsIgnoreCase(card.getStatus())) {
            return deny(request, occurredAt, zone.getId(), AccessDecisionReasonCode.CARD_REVOKED, "Card is revoked");
        }

        if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
            return deny(request, occurredAt, zone.getId(), AccessDecisionReasonCode.CARD_INACTIVE, "Card is inactive");
        }

        User user = userRepository.findByAccessCard_NumAndAccessCard_DeletedAtIsNullAndDeletedAtIsNull(cardHash)
            .orElse(null);
        if (user == null) {
            return deny(request, occurredAt, zone.getId(), AccessDecisionReasonCode.USER_NOT_FOUND, "No active user is assigned to this card");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            return deny(request, occurredAt, zone.getId(), user.getId(), AccessDecisionReasonCode.USER_INACTIVE, "User is inactive");
        }

        Set<Profile> activeProfiles = user.getProfiles().stream()
            .filter(profile -> profile.getDeletedAt() == null)
            .collect(Collectors.toSet());
        if (activeProfiles.isEmpty()) {
            return deny(request, occurredAt, zone.getId(), user.getId(), AccessDecisionReasonCode.PROFILE_MISSING, "User does not have an active profile");
        }

        Set<Zone> allowedZones = activeProfiles.stream()
            .flatMap(profile -> profile.getZones().stream())
            .collect(Collectors.toSet());
        boolean zoneAllowed = allowedZones != null && allowedZones.stream()
            .anyMatch(allowedZone -> allowedZone.getId() != null
                && allowedZone.getDeletedAt() == null
                && allowedZone.getId().equals(zone.getId()));
        if (!zoneAllowed) {
            return deny(request, occurredAt, zone.getId(), user.getId(), AccessDecisionReasonCode.ZONE_NOT_ALLOWED, "Profile does not grant access to this zone");
        }

        Set<Schedule> allowedSchedules = activeProfiles.stream()
            .flatMap(profile -> profile.getSchedules().stream())
            .collect(Collectors.toSet());
        boolean withinSchedule = scheduleEvaluationService.isAccessAllowed(allowedSchedules, occurredAt);
        if (!withinSchedule) {
            return deny(request, occurredAt, zone.getId(), user.getId(), AccessDecisionReasonCode.OUTSIDE_SCHEDULE, "Access is outside allowed schedule");
        }

        AccessSwipeResponseDTO response = new AccessSwipeResponseDTO(
            true,
            AccessDecisionType.AUTHORIZED,
            AccessDecisionReasonCode.AUTHORIZED,
            "Access authorized",
            request.getDeviceId(),
            request.getDoorId(),
            zone.getId(),
            user.getId(),
            normalizedCardUid,
            occurredAt
        );

        writeAccessLog(response, device, zone, card.getUuid());
        return response;
    }

    private AccessSwipeResponseDTO deny(
        AccessSwipeRequestDTO request,
        Instant occurredAt,
        AccessDecisionReasonCode reasonCode,
        String reasonMessage
    ) {
        return deny(request, occurredAt, null, null, reasonCode, reasonMessage);
    }

    private AccessSwipeResponseDTO deny(
        AccessSwipeRequestDTO request,
        Instant occurredAt,
        Integer zoneId,
        AccessDecisionReasonCode reasonCode,
        String reasonMessage
    ) {
        return deny(request, occurredAt, zoneId, null, reasonCode, reasonMessage);
    }

    private AccessSwipeResponseDTO deny(
        AccessSwipeRequestDTO request,
        Instant occurredAt,
        Integer zoneId,
        Integer userId,
        AccessDecisionReasonCode reasonCode,
        String reasonMessage
    ) {
        AccessSwipeResponseDTO response = new AccessSwipeResponseDTO(
            false,
            AccessDecisionType.DENIED,
            reasonCode,
            reasonMessage,
            request.getDeviceId(),
            request.getDoorId(),
            zoneId,
            userId,
            request.getCardUid().trim(),
            occurredAt
        );
        Device device = null;
        if (request.getDeviceId() != null) {
            device = deviceRepository.findByIdAndDeletedAtIsNull(request.getDeviceId()).orElse(null);
        }
        Zone zone = null;
        if (device != null && request.getDoorId() != null) {
            zone = device.getDoors().stream()
                .filter(door -> door.getId() != null && door.getId().equals(request.getDoorId()))
                .map(Door::getZone)
                .filter(candidateZone -> candidateZone != null && candidateZone.getDeletedAt() == null)
                .findFirst()
                .orElse(null);
        }
        writeAccessLog(response, device, zone, CardHashingService.sha256(request.getCardUid().trim()));
        return response;
    }

    private void writeAccessLog(AccessSwipeResponseDTO response, Device device, Zone zone, String cardReference) {
        AccessLog accessLog = AccessLog.builder()
            .cardReference(cardReference)
            .device(device)
            .zone(zone)
            .decision(response.getDecision().name())
            .reason(response.getReasonCode().name())
            .timestamp(response.getOccurredAt())
            .build();

        accessLogRepository.save(accessLog);
    }
}

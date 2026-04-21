package com.hsware.cacs.mapper;

import com.hsware.cacs.dto.*;
import com.hsware.cacs.entity.*;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.RoleRepository;
import com.hsware.cacs.repository.ScheduleRepository;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.repository.ZoneRepository;
import com.hsware.cacs.repository.ZoneTypeRepository;
import com.hsware.cacs.service.CardHashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DtoMapper {

    private final AccessCardRepository accessCardRepository;
    private final ProfileRepository profileRepository;
    private final RoleRepository roleRepository;
    private final ZoneRepository zoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;
    private final DoorRepository doorRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final CardHashingService cardHashingService;

    public UserDTO toUserDTO(User user) {
        if (user == null) return null;
        
        String name = (nullToEmpty(user.getFirstName()) + " " + nullToEmpty(user.getLastName())).trim();
        if (name.isEmpty()) {
            name = nullToEmpty(user.getEmail());
        }

        Set<String> roleNames = user.getRoles().stream()
            .map(Role::getName)
            .filter(roleName -> roleName != null && !roleName.isBlank())
            .map(String::toUpperCase)
            .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<Integer> profileIds = user.getProfiles().stream()
            .map(Profile::getId)
            .filter(id -> id != null)
            .collect(Collectors.toCollection(LinkedHashSet::new));

        return new UserDTO(
            user.getId(),
            name,
            nullToEmpty(user.getFirstName()),
            nullToEmpty(user.getLastName()),
            nullToEmpty(user.getEmail()),
            roleNames,
            nullToEmpty(user.getStatus()),
            nullToEmpty(user.getAddress()),
            user.getAccessCard() != null ? user.getAccessCard().getId() : null,
            profileIds,
            user.getCreatedAt()
        );
    }

    public User toUser(UserCreateDTO dto) {
        if (dto == null) return null;
        
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword() != null ? dto.getPassword() : "CHANGE_ME");
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        user.setAddress(dto.getAddress());
        user.setRoles(resolveRoles(dto.getRoles(), true));
        
        if (dto.getCardId() != null) {
            accessCardRepository.findById(dto.getCardId()).ifPresent(user::setAccessCard);
        }
        user.setProfiles(resolveProfiles(dto.getProfileIds(), false));
        
        return user;
    }

    public void updateUserFromDTO(UserUpdateDTO dto, User user) {
        if (dto == null || user == null) return;
        
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) user.setPassword(dto.getPassword());
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus().toUpperCase());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getRoles() != null) user.setRoles(resolveRoles(dto.getRoles(), false));
        
        if (dto.getCardId() != null) {
            if (dto.getCardId() == 0) {
                user.setAccessCard(null);
            } else {
                accessCardRepository.findById(dto.getCardId()).ifPresent(user::setAccessCard);
            }
        }
        if (dto.getProfileIds() != null) {
            user.setProfiles(resolveProfiles(dto.getProfileIds(), true));
        }
    }

    private Set<Profile> resolveProfiles(Set<Integer> profileIds, boolean allowClearWithZero) {
        Set<Integer> normalizedProfileIds = new LinkedHashSet<>();

        if (profileIds != null) {
            normalizedProfileIds.addAll(profileIds);
        }

        if (allowClearWithZero && normalizedProfileIds.contains(0)) {
            return new LinkedHashSet<>();
        }
        normalizedProfileIds.remove(0);

        if (normalizedProfileIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<Profile> resolvedProfiles = profileRepository.findAllById(normalizedProfileIds).stream()
            .filter(profile -> profile.getDeletedAt() == null)
            .toList();
        Set<Integer> resolvedIds = resolvedProfiles.stream().map(Profile::getId).collect(Collectors.toSet());

        Set<Integer> missingProfileIds = normalizedProfileIds.stream()
            .filter(profileId -> !resolvedIds.contains(profileId))
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (!missingProfileIds.isEmpty()) {
            throw new IllegalArgumentException("Unknown profiles: " + missingProfileIds);
        }

        return new LinkedHashSet<>(resolvedProfiles);
    }

    private Set<Role> resolveRoles(Set<String> requestedRoles, boolean applyDefaultUserRole) {
        Set<String> normalizedRoleNames = new LinkedHashSet<>();

        if (requestedRoles != null) {
            requestedRoles.stream()
                .filter(roleName -> roleName != null && !roleName.isBlank())
                .map(String::toUpperCase)
                .forEach(normalizedRoleNames::add);
        }

        if (normalizedRoleNames.isEmpty() && applyDefaultUserRole) {
            normalizedRoleNames.add("USER");
        }

        List<Role> resolvedRoles = roleRepository.findByNameInAndDeletedAtIsNull(normalizedRoleNames);
        Set<String> resolvedRoleNames = resolvedRoles.stream()
            .map(Role::getName)
            .map(String::toUpperCase)
            .collect(Collectors.toSet());

        Set<String> missingRoleNames = normalizedRoleNames.stream()
            .filter(roleName -> !resolvedRoleNames.contains(roleName))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        if (!missingRoleNames.isEmpty()) {
            throw new IllegalArgumentException("Unknown roles: " + String.join(", ", missingRoleNames));
        }

        return new LinkedHashSet<>(resolvedRoles);
    }
    public AccessCardDTO toAccessCardDTO(AccessCard accessCard) {
        if (accessCard == null) return null;
        
        // Find user associated with this access card
        Integer userId = null;
        String userName = "Unassigned";
        if (accessCard.getId() != null) {
            var userOpt = userRepository.findByAccessCard_IdAndDeletedAtIsNull(accessCard.getId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                userId = user.getId();
                String name = (nullToEmpty(user.getFirstName()) + " " + nullToEmpty(user.getLastName())).trim();
                if (name.isEmpty()) {
                    name = nullToEmpty(user.getEmail());
                }
                if (name.isEmpty()) {
                    name = "Unassigned";
                }
                userName = name;
            }
        }
        
        return new AccessCardDTO(
            accessCard.getId(),
            "",
            nullToEmpty(accessCard.getNum()),
            nullToEmpty(accessCard.getStatus()),
            userId,
            userName,
            accessCard.getCreatedAt()
        );
    }

    public AccessCard toAccessCard(AccessCardCreateDTO dto) {
        if (dto == null) return null;
        
        AccessCard accessCard = new AccessCard();
        accessCard.setUid(null);
        accessCard.setNum(cardHashingService.hash(dto.getUid()));
        accessCard.setStatus("INACTIVE");
        
        return accessCard;
    }

    public void updateAccessCardFromDTO(AccessCardUpdateDTO dto, AccessCard accessCard) {
        if (dto == null || accessCard == null) return;
        
        if (dto.getUid() != null) {
            accessCard.setUid(null);
            accessCard.setNum(cardHashingService.hash(dto.getUid()));
        }
        if (dto.getStatus() != null) accessCard.setStatus(dto.getStatus().toUpperCase());
    }

    public ProfileDTO toProfileDTO(Profile profile) {
        if (profile == null) return null;
        
        Set<Integer> scheduleIds = profile.getSchedules().stream()
            .map(Schedule::getId)
            .collect(Collectors.toSet());

        Set<Integer> zoneIds = profile.getZones().stream()
            .map(Zone::getId)
            .collect(Collectors.toSet());

        return new ProfileDTO(
            profile.getId(),
            nullToEmpty(profile.getName()),
            scheduleIds,
            zoneIds,
            "",
            0,
            profile.getCreatedAt()
        );
    }

    public Profile toProfile(ProfileCreateDTO dto) {
        if (dto == null) return null;
        
        Profile profile = new Profile();
        profile.setName(dto.getName());

        if (dto.getScheduleIds() != null) {
            Set<Schedule> schedules = dto.getScheduleIds().stream()
                .map(scheduleId -> scheduleRepository.findById(scheduleId).orElse(null))
                .filter(schedule -> schedule != null)
                .collect(Collectors.toSet());
            profile.setSchedules(schedules);
        }
        
        if (dto.getZoneIds() != null) {
            Set<Zone> zones = dto.getZoneIds().stream()
                .map(zoneId -> zoneRepository.findById(zoneId).orElse(null))
                .filter(zone -> zone != null)
                .collect(Collectors.toSet());
            profile.setZones(zones);
        }
        
        return profile;
    }

    public void updateProfileFromDTO(ProfileUpdateDTO dto, Profile profile) {
        if (dto == null || profile == null) return;
        
        if (dto.getName() != null) profile.setName(dto.getName());
        if (dto.getScheduleIds() != null) {
            Set<Schedule> schedules = dto.getScheduleIds().stream()
                .map(scheduleId -> scheduleRepository.findById(scheduleId).orElse(null))
                .filter(schedule -> schedule != null)
                .collect(Collectors.toSet());
            profile.setSchedules(schedules);
        }
        if (dto.getZoneIds() != null) {
            Set<Zone> zones = dto.getZoneIds().stream()
                .map(zoneId -> zoneRepository.findById(zoneId).orElse(null))
                .filter(zone -> zone != null)
                .collect(Collectors.toSet());
            profile.setZones(zones);
        }
    }

    public ZoneDTO toZoneDTO(Zone zone) {
        if (zone == null) return null;

        Map<String, Object> zoneTypeMap = null;
        if (zone.getZoneType() != null) {
            ZoneType t = zone.getZoneType();
            zoneTypeMap = Map.of(
                    "id", t.getId(),
                    "name", nullToEmpty(t.getName()),
                    "level", t.getSecurityLevel() != null ? t.getSecurityLevel() : 0);
        }

        String managerDisplay = null;
        List<User> managers = userRepository.findByResponsibleZones_IdAndDeletedAtIsNull(zone.getId());
        if (!managers.isEmpty()) {
            managerDisplay = userDisplayName(managers.get(0));
        }

        return new ZoneDTO(
                zone.getId(),
                nullToEmpty(zone.getName()),
                nullToEmpty(zone.getLocation()),
                zone.getZoneType() != null ? zone.getZoneType().getId() : null,
                zoneTypeMap,
                managerDisplay != null && !managerDisplay.isEmpty() ? managerDisplay : null,
                zone.getCreatedAt());
    }

    public Zone toZone(ZoneCreateDTO dto) {
        if (dto == null) return null;

        Zone zone = new Zone();
        zone.setName(dto.getName());
        zone.setLocation(dto.getLocation());

        if (dto.getZoneTypeId() == null) {
            throw new IllegalArgumentException("Zone type is required");
        }

        zoneTypeRepository.findById(dto.getZoneTypeId())
                .ifPresentOrElse(
                        zone::setZoneType,
                        () -> { throw new IllegalArgumentException("Invalid zone type ID"); }
                );

        return zone;
    }

    public void updateZoneFromDTO(ZoneUpdateDTO dto, Zone zone) {
        if (dto == null || zone == null) return;

        if (dto.getName() != null) zone.setName(dto.getName());
        if (dto.getLocation() != null) zone.setLocation(dto.getLocation());
        if (dto.getZoneTypeId() != null) {
            if (dto.getZoneTypeId() == 0) {
                zone.setZoneType(null);
            } else {
                zoneTypeRepository.findById(dto.getZoneTypeId()).ifPresent(zone::setZoneType);
            }
        }
    }

    private String userDisplayName(User user) {
        String name = (nullToEmpty(user.getFirstName()) + " " + nullToEmpty(user.getLastName())).trim();
        if (name.isEmpty()) {
            name = nullToEmpty(user.getEmail());
        }
        return name;
    }

    private String nullToEmpty(String s) {
        return s != null ? s : "";
    }

    public DeviceDTO toDeviceDTO(Device device) {
        if (device == null) return null;

        List<Door> sortedDoors = device.getDoors().stream()
                .sorted((d1, d2) -> Integer.compare(d1.getId(), d2.getId()))
                .toList();

        List<Integer> doorIds = sortedDoors.stream()
                .map(Door::getId)
                .toList();

        List<String> doorNames = sortedDoors.stream()
                .map(d -> nullToEmpty(d.getName()))
                .toList();

        DeviceDTO deviceDTO = new DeviceDTO();
        deviceDTO.setId(device.getId());
        deviceDTO.setCreatedAt(device.getCreatedAt());
        deviceDTO.setSerialNumber(nullToEmpty(device.getSerialNumber()));
        deviceDTO.setModelName(nullToEmpty(device.getModelName()));
        deviceDTO.setType(device.getType() != null ? device.getType().name() : null);
        deviceDTO.setStatus(nullToEmpty(device.getStatus()));
        deviceDTO.setIp(nullToEmpty(device.getIp()));
        deviceDTO.setPort(device.getPort());
        deviceDTO.setLastSeenAt(device.getLastSeenAt());
        deviceDTO.setDoorIds(doorIds);
        deviceDTO.setDoorNames(doorNames);
        return deviceDTO;
    }

    public Device toDevice(DeviceCreateDTO dto) {
        if (dto == null) return null;

        Device device = new Device();
        device.setSerialNumber(dto.getSerialNumber());
        device.setModelName(dto.getModelName());
        device.setType(dto.getType());
        device.setStatus("OFFLINE");
        device.setIp(dto.getIp());
        device.setPort(dto.getPort());

        if (dto.getDoorIds() != null && !dto.getDoorIds().isEmpty()) {
            List<Door> doors = doorRepository.findAllById(dto.getDoorIds());
            device.setDoors(new HashSet<>(doors));
        }

        return device;
    }

    public void updateDeviceFromDTO(DeviceUpdateDTO dto, Device device) {
        if (dto == null || device == null) return;

        Optional.ofNullable(dto.getSerialNumber()).ifPresent(device::setSerialNumber);
        Optional.ofNullable(dto.getModelName()).ifPresent(device::setModelName);
        Optional.ofNullable(dto.getType()).ifPresent(device::setType);
        Optional.ofNullable(dto.getStatus()).ifPresent(status -> device.setStatus(status.toUpperCase()));
        Optional.ofNullable(dto.getIp()).ifPresent(device::setIp);
        Optional.ofNullable(dto.getPort()).ifPresent(device::setPort);

        if (dto.getDoorIds() != null) {
            if (dto.getDoorIds().isEmpty()) {
                device.setDoors(new HashSet<>());
            } else {
                List<Door> doors = doorRepository.findAllById(dto.getDoorIds());
                device.setDoors(new HashSet<>(doors));
            }
        }
    }

    public DoorDTO toDoorDTO(Door door) {
        if (door == null) return null;
        
        Zone zone = door.getZone();
        return new DoorDTO(
            door.getId(),
            nullToEmpty(door.getName()),
            zone != null ? zone.getId() : null,
            zone != null ? nullToEmpty(zone.getName()) : "",
            nullToEmpty(door.getLocation()),
            door.getCreatedAt()
        );
    }

    public Door toDoor(DoorCreateDTO dto) {
        if (dto == null) return null;
        
        Door door = new Door();
        door.setName(dto.getName());
        door.setLocation(dto.getLocation());
        
        if (dto.getZoneId() != null) {
            zoneRepository.findById(dto.getZoneId()).ifPresent(door::setZone);
        }
        
        return door;
    }

    public void updateDoorFromDTO(DoorUpdateDTO dto, Door door) {
        if (dto == null || door == null) return;
        
        if (dto.getName() != null) door.setName(dto.getName());
        if (dto.getLocation() != null) door.setLocation(dto.getLocation());
        
        if (dto.getZoneId() != null) {
            if (dto.getZoneId() == 0) {
                door.setZone(null);
            } else {
                zoneRepository.findById(dto.getZoneId()).ifPresent(door::setZone);
            }
        }
    }

    public ScheduleDTO toScheduleDTO(Schedule schedule) {
        if (schedule == null) return null;
        
        return new ScheduleDTO(
            schedule.getId(),
            nullToEmpty(schedule.getName()),
            "",
            "",
            "",
            "",
            schedule.getCreatedAt()
        );
    }

    public Schedule toSchedule(ScheduleCreateDTO dto) {
        if (dto == null) return null;
        
        Schedule schedule = new Schedule();
        schedule.setName(dto.getName());
        
        return schedule;
    }

    public void updateScheduleFromDTO(ScheduleUpdateDTO dto, Schedule schedule) {
        if (dto == null || schedule == null) return;
        
        if (dto.getName() != null) schedule.setName(dto.getName());
    }

    public TimeSlotDTO toTimeSlotDTO(DayTimeSlot timeSlot) {
        if (timeSlot == null) return null;
        
        return new TimeSlotDTO(
            timeSlot.getId(),
            timeSlot.getScheduleDay().getId(),
            nullToEmpty(timeSlot.getTitle()),
            timeSlot.getScheduleDay().getDayIndex(),
            timeSlot.getStartTime().toString(),
            timeSlot.getEndTime().toString(),
            null // Time slots don't have separate created at
        );
    }

    public DayTimeSlot toTimeSlot(TimeSlotCreateDTO dto, ScheduleDay scheduleDay) {
        if (dto == null) return null;
        
        DayTimeSlot timeSlot = new DayTimeSlot();
        timeSlot.setScheduleDay(scheduleDay);
        timeSlot.setTitle(dto.getTitle());
        timeSlot.setStartTime(java.time.LocalTime.parse(dto.getStartTime()));
        timeSlot.setEndTime(java.time.LocalTime.parse(dto.getEndTime()));
        
        return timeSlot;
    }

    public void updateTimeSlotFromDTO(TimeSlotUpdateDTO dto, DayTimeSlot timeSlot) {
        if (dto == null || timeSlot == null) return;
        
        if (dto.getTitle() != null) {
            timeSlot.setTitle(dto.getTitle());
        }
        if (dto.getStartTime() != null) {
            timeSlot.setStartTime(java.time.LocalTime.parse(dto.getStartTime()));
        }
        if (dto.getEndTime() != null) {
            timeSlot.setEndTime(java.time.LocalTime.parse(dto.getEndTime()));
        }
    }
}

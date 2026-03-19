package com.hsware.cacs.mapper;

import com.hsware.cacs.dto.*;
import com.hsware.cacs.entity.*;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DtoMapper {

    private final AccessCardRepository accessCardRepository;
    private final ProfileRepository profileRepository;
    private final ZoneRepository zoneRepository;

    public UserDTO toUserDTO(User user) {
        if (user == null) return null;
        
        String name = (nullToEmpty(user.getFirstName()) + " " + nullToEmpty(user.getLastName())).trim();
        if (name.isEmpty()) {
            name = nullToEmpty(user.getEmail());
        }

        return new UserDTO(
            user.getId(),
            name,
            nullToEmpty(user.getFirstName()),
            nullToEmpty(user.getLastName()),
            nullToEmpty(user.getEmail()),
            nullToEmpty(user.getRole()),
            nullToEmpty(user.getStatus()),
            nullToEmpty(user.getAddress()),
            user.getAccessCard() != null ? user.getAccessCard().getId() : null,
            user.getProfile() != null ? user.getProfile().getId() : null,
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
        user.setRole(dto.getRole() != null ? dto.getRole().toUpperCase() : "USER");
        user.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        user.setAddress(dto.getAddress());
        
        if (dto.getCardId() != null) {
            accessCardRepository.findById(dto.getCardId()).ifPresent(user::setAccessCard);
        }
        if (dto.getProfileId() != null) {
            profileRepository.findById(dto.getProfileId()).ifPresent(user::setProfile);
        }
        
        return user;
    }

    public void updateUserFromDTO(UserUpdateDTO dto, User user) {
        if (dto == null || user == null) return;
        
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) user.setPassword(dto.getPassword());
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getRole() != null) user.setRole(dto.getRole().toUpperCase());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus().toUpperCase());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        
        if (dto.getCardId() != null) {
            if (dto.getCardId() == 0) {
                user.setAccessCard(null);
            } else {
                accessCardRepository.findById(dto.getCardId()).ifPresent(user::setAccessCard);
            }
        }
        if (dto.getProfileId() != null) {
            if (dto.getProfileId() == 0) {
                user.setProfile(null);
            } else {
                profileRepository.findById(dto.getProfileId()).ifPresent(user::setProfile);
            }
        }
    }

    public AccessCardDTO toAccessCardDTO(AccessCard accessCard) {
        if (accessCard == null) return null;
        
        return new AccessCardDTO(
            accessCard.getId(),
            nullToEmpty(accessCard.getUid()),
            nullToEmpty(accessCard.getNum()),
            nullToEmpty(accessCard.getStatus()),
            null
        );
    }

    public AccessCard toAccessCard(AccessCardCreateDTO dto) {
        if (dto == null) return null;
        
        AccessCard accessCard = new AccessCard();
        accessCard.setUid(dto.getUid());
        accessCard.setNum(dto.getNum());
        accessCard.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        
        return accessCard;
    }

    public void updateAccessCardFromDTO(AccessCardUpdateDTO dto, AccessCard accessCard) {
        if (dto == null || accessCard == null) return;
        
        if (dto.getUid() != null) accessCard.setUid(dto.getUid());
        if (dto.getNum() != null) accessCard.setNum(dto.getNum());
        if (dto.getStatus() != null) accessCard.setStatus(dto.getStatus().toUpperCase());
    }

    public ProfileDTO toProfileDTO(Profile profile) {
        if (profile == null) return null;
        
        Set<Integer> zoneIds = profile.getZones().stream()
            .map(Zone::getId)
            .collect(Collectors.toSet());

        return new ProfileDTO(
            profile.getId(),
            nullToEmpty(profile.getName()),
            profile.getSchedule() != null ? profile.getSchedule().getId() : null,
            zoneIds,
            null
        );
    }

    public Profile toProfile(ProfileCreateDTO dto) {
        if (dto == null) return null;
        
        Profile profile = new Profile();
        profile.setName(dto.getName());
        
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
        
        return new ZoneDTO(
            zone.getId(),
            nullToEmpty(zone.getName()),
            nullToEmpty(zone.getLocation()),
            zone.getZoneType() != null ? zone.getZoneType().getId() : null,
            null
        );
    }

    public Zone toZone(ZoneCreateDTO dto) {
        if (dto == null) return null;
        
        Zone zone = new Zone();
        zone.setName(dto.getName());
        zone.setLocation(dto.getLocation());
        
        return zone;
    }

    public void updateZoneFromDTO(ZoneUpdateDTO dto, Zone zone) {
        if (dto == null || zone == null) return;
        
        if (dto.getName() != null) zone.setName(dto.getName());
        if (dto.getLocation() != null) zone.setLocation(dto.getLocation());
        if (dto.getZoneTypeId() != null) {
            // Note: ZoneType repository would need to be injected if this is needed
        }
    }

    private String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}

package com.hsware.cacs.mapper;

import com.hsware.cacs.dto.*;
import com.hsware.cacs.entity.*;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.repository.ZoneRepository;
import com.hsware.cacs.repository.ZoneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DtoMapper {

    private final AccessCardRepository accessCardRepository;
    private final ProfileRepository profileRepository;
    private final ZoneRepository zoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;
    private final DoorRepository doorRepository;
    private final UserRepository userRepository;

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
        
        // Find user associated with this access card
        Integer userId = null;
        String userName = "Unassigned";
        if (accessCard.getId() != null) {
            var userOpt = userRepository.findByAccessCard_Id(accessCard.getId());
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
            nullToEmpty(accessCard.getUid()),
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
            "",
            0,
            profile.getCreatedAt()
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
            door.getCreatedAt()
        );
    }

    public Door toDoor(DoorCreateDTO dto) {
        if (dto == null) return null;
        
        Door door = new Door();
        door.setName(dto.getName());
        
        if (dto.getZoneId() != null) {
            zoneRepository.findById(dto.getZoneId()).ifPresent(door::setZone);
        }
        
        return door;
    }

    public void updateDoorFromDTO(DoorUpdateDTO dto, Door door) {
        if (dto == null || door == null) return;
        
        if (dto.getName() != null) door.setName(dto.getName());
        
        if (dto.getZoneId() != null) {
            zoneRepository.findById(dto.getZoneId()).ifPresent(door::setZone);
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
}

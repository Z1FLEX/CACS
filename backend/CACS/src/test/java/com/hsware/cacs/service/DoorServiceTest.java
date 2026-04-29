package com.hsware.cacs.service;

import com.hsware.cacs.dto.DoorCreateDTO;
import com.hsware.cacs.dto.DoorUpdateDTO;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ZoneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoorServiceTest {

    @Mock
    private DoorRepository doorRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private DtoMapper dtoMapper;

    @InjectMocks
    private DoorService doorService;

    @Test
    void createRejectsDeviceFromDifferentZone() {
        Zone doorZone = Zone.builder().id(1).name("Zone A").build();
        Zone deviceZone = Zone.builder().id(2).name("Zone B").build();
        Device device = Device.builder().id(7).zone(deviceZone).relayCount(4).build();
        Door door = Door.builder().name("Main Door").zone(doorZone).device(device).relayIndex(1).build();

        when(dtoMapper.toDoor(new DoorCreateDTO("Main Door", 1, null, 7, 1))).thenReturn(door);
        when(zoneRepository.findByIdAndDeletedAtIsNull(1)).thenReturn(Optional.of(doorZone));
        when(deviceRepository.findByIdAndDeletedAtIsNull(7)).thenReturn(Optional.of(device));

        assertThatThrownBy(() -> doorService.create(new DoorCreateDTO("Main Door", 1, null, 7, 1)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Door zone must match the selected device zone");
    }

    @Test
    void updateRejectsOccupiedRelayOnDevice() {
        Zone zone = Zone.builder().id(1).name("Zone A").build();
        Device device = Device.builder().id(7).zone(zone).relayCount(4).build();
        Door existingDoor = Door.builder().id(99).name("Server").zone(zone).build();

        when(doorRepository.findByIdAndDeletedAtIsNull(99)).thenReturn(Optional.of(existingDoor));
        when(zoneRepository.findByIdAndDeletedAtIsNull(1)).thenReturn(Optional.of(zone));
        when(deviceRepository.findByIdAndDeletedAtIsNull(7)).thenReturn(Optional.of(device));
        when(doorRepository.existsByDevice_IdAndRelayIndexAndDeletedAtIsNullAndIdNot(7, 2, 99)).thenReturn(true);

        existingDoor.setZone(zone);
        existingDoor.setDevice(device);
        existingDoor.setRelayIndex(2);

        assertThatThrownBy(() -> doorService.update(99, new DoorUpdateDTO()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Selected relay is already assigned to another door");
    }
}

package com.hsware.cacs.service;

import com.hsware.cacs.dto.DoorDTO;
import com.hsware.cacs.dto.DoorCreateDTO;
import com.hsware.cacs.dto.DoorUpdateDTO;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DoorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoorService {

    private final DoorRepository doorRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<DoorDTO> findAll() {
        return doorRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toDoorDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DoorDTO> findById(Integer id) {
        return doorRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toDoorDTO);
    }

    @Transactional
    public DoorDTO create(DoorCreateDTO doorCreateDTO) {
        Door door = dtoMapper.toDoor(doorCreateDTO);
        door = doorRepository.save(door);
        return dtoMapper.toDoorDTO(door);
    }

    @Transactional
    public Optional<DoorDTO> update(Integer id, DoorUpdateDTO doorUpdateDTO) {
        Optional<Door> existing = doorRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Door door = existing.get();
        dtoMapper.updateDoorFromDTO(doorUpdateDTO, door);
        door = doorRepository.save(door);
        return Optional.of(dtoMapper.toDoorDTO(door));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Door> existing = doorRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Door d = existing.get();
        d.setDeletedAt(java.time.Instant.now());
        doorRepository.save(d);
        return true;
    }

}

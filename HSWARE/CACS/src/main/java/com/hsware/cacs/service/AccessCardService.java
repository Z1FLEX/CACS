package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardDTO;
import com.hsware.cacs.dto.AccessCardCreateDTO;
import com.hsware.cacs.dto.AccessCardUpdateDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccessCardService {

    private final AccessCardRepository accessCardRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<AccessCardDTO> findAll() {
        return accessCardRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toAccessCardDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AccessCardDTO> findById(Integer id) {
        return accessCardRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toAccessCardDTO);
    }

    @Transactional
    public AccessCardDTO create(AccessCardCreateDTO accessCardCreateDTO) {
        AccessCard accessCard = dtoMapper.toAccessCard(accessCardCreateDTO);
        accessCard = accessCardRepository.save(accessCard);
        return dtoMapper.toAccessCardDTO(accessCard);
    }

    @Transactional
    public Optional<AccessCardDTO> update(Integer id, AccessCardUpdateDTO accessCardUpdateDTO) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        AccessCard accessCard = existing.get();
        dtoMapper.updateAccessCardFromDTO(accessCardUpdateDTO, accessCard);
        accessCard = accessCardRepository.save(accessCard);
        return Optional.of(dtoMapper.toAccessCardDTO(accessCard));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        AccessCard c = existing.get();
        c.setDeletedAt(java.time.Instant.now());
        c.setStatus("INACTIVE");
        accessCardRepository.save(c);
        return true;
    }

}

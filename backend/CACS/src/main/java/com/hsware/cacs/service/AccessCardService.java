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
import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccessCardService {

    private final AccessCardRepository accessCardRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<AccessCardDTO> findAll() {
        List<AccessCard> cards = accessCardRepository.findByDeletedAtIsNull();
        Map<Integer, User> usersByCardId = cards.isEmpty()
            ? Collections.emptyMap()
            : userRepository.findByAccessCard_IdInAndDeletedAtIsNull(
                cards.stream()
                    .map(AccessCard::getId)
                    .toList()
            ).stream()
            .filter(user -> user.getAccessCard() != null && user.getAccessCard().getId() != null)
            .collect(Collectors.toMap(user -> user.getAccessCard().getId(), user -> user));

        return cards.stream()
                .map(card -> dtoMapper.toAccessCardDTO(card, usersByCardId.get(card.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AccessCardDTO> findById(Integer id) {
        return accessCardRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toAccessCardDTO);
    }

    @Transactional
    public AccessCardDTO create(AccessCardCreateDTO accessCardCreateDTO) {
        AccessCard accessCard = dtoMapper.toAccessCard(accessCardCreateDTO);
        if (accessCardRepository.existsByNumAndDeletedAtIsNull(accessCard.getNum())) {
            throw new IllegalArgumentException("Card already exists");
        }
        accessCard.setStatus("INACTIVE");
        accessCard = accessCardRepository.save(accessCard);
        return dtoMapper.toAccessCardDTO(accessCard);
    }

    @Transactional
    public Optional<AccessCardDTO> update(Integer id, AccessCardUpdateDTO accessCardUpdateDTO) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        AccessCard accessCard = existing.get();
        dtoMapper.updateAccessCardFromDTO(accessCardUpdateDTO, accessCard);
        if (accessCardRepository.existsByNumAndDeletedAtIsNullAndIdNot(accessCard.getNum(), id)) {
            throw new IllegalArgumentException("Card already exists");
        }
        validateStateTransition(accessCard);
        accessCard = accessCardRepository.save(accessCard);
        return Optional.of(dtoMapper.toAccessCardDTO(accessCard));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        AccessCard c = existing.get();
        userRepository.findByAccessCard_IdAndDeletedAtIsNull(c.getId()).ifPresent(user -> user.setAccessCard(null));
        c.setDeletedAt(java.time.Instant.now());
        c.setStatus("INACTIVE");
        accessCardRepository.save(c);
        return true;
    }

    private void validateStateTransition(AccessCard accessCard) {
        if (!"ACTIVE".equalsIgnoreCase(accessCard.getStatus())) {
            return;
        }

        User assignedUser = userRepository.findByAccessCard_IdAndDeletedAtIsNull(accessCard.getId()).orElse(null);
        if (assignedUser == null) {
            throw new IllegalArgumentException("Only assigned cards can be ACTIVE");
        }
    }

}

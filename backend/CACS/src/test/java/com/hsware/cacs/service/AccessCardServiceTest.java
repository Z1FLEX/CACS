package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardCreateDTO;
import com.hsware.cacs.dto.AccessCardDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccessCardServiceTest {

    @Mock
    private AccessCardRepository accessCardRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DtoMapper dtoMapper;

    @InjectMocks
    private AccessCardService accessCardService;

    @Test
    void createAlwaysPersistsCardsAsInactive() {
        AccessCardCreateDTO createDTO = new AccessCardCreateDTO("CARD-123", "ACTIVE");
        AccessCard mappedCard = AccessCard.builder()
            .num("hash")
            .status("ACTIVE")
            .build();
        AccessCardDTO persistedDto = new AccessCardDTO();

        when(dtoMapper.toAccessCard(createDTO)).thenReturn(mappedCard);
        when(accessCardRepository.existsByNumAndDeletedAtIsNull("hash")).thenReturn(false);
        when(accessCardRepository.save(any(AccessCard.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dtoMapper.toAccessCardDTO(any(AccessCard.class))).thenReturn(persistedDto);

        accessCardService.create(createDTO);

        ArgumentCaptor<AccessCard> savedCard = ArgumentCaptor.forClass(AccessCard.class);
        verify(accessCardRepository).save(savedCard.capture());
        assertThat(savedCard.getValue().getStatus()).isEqualTo("INACTIVE");
    }
}

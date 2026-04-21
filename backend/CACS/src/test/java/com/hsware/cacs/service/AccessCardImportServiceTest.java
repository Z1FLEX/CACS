package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardImportResultDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.repository.AccessCardRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccessCardImportServiceTest {

    @Mock
    private AccessCardRepository accessCardRepository;

    @Mock
    private CardHashingService cardHashingService;

    @InjectMocks
    private AccessCardImportService accessCardImportService;

    @Test
    void importCsvCreatesInactiveCardsFromUidColumn() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "cards.csv",
            "text/csv",
            "uid,type\nUID-1,STAFF\nUID-2,VISITOR\n".getBytes()
        );

        when(cardHashingService.hash("UID-1")).thenReturn("hash-1");
        when(cardHashingService.hash("UID-2")).thenReturn("hash-2");
        when(accessCardRepository.findByNumInAndDeletedAtIsNull(anyList())).thenReturn(List.of());

        AccessCardImportResultDTO result = accessCardImportService.importCsv(file);

        ArgumentCaptor<List<AccessCard>> cardsCaptor = ArgumentCaptor.forClass(List.class);
        verify(accessCardRepository).saveAll(cardsCaptor.capture());

        assertThat(result.getImportedCount()).isEqualTo(2);
        assertThat(cardsCaptor.getValue())
            .extracting(AccessCard::getStatus)
            .containsExactly("INACTIVE", "INACTIVE");
    }

    @Test
    void importCsvRejectsDuplicateCardsWithinSameFile() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "cards.csv",
            "text/csv",
            "uid\nUID-1\nUID-1\n".getBytes()
        );

        when(cardHashingService.hash("UID-1")).thenReturn("hash-1");

        assertThatThrownBy(() -> accessCardImportService.importCsv(file))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Duplicate card detected");
    }
}

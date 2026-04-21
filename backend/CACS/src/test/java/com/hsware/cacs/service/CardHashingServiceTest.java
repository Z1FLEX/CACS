package com.hsware.cacs.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CardHashingServiceTest {

    private final CardHashingService cardHashingService = new CardHashingService();

    @Test
    void hashesTrimmedUidWithSha256() {
        assertEquals(
            "6b577eb67c056ba5bbb3ac38f38535c63fad2b19fb99ef471fc5dfbf2012c5f5",
            cardHashingService.hash("  CARD-123  ")
        );
    }

    @Test
    void rejectsBlankUid() {
        assertThrows(IllegalArgumentException.class, () -> cardHashingService.hash("   "));
    }
}

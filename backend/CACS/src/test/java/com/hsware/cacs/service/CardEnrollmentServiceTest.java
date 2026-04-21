package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardEnrollmentStatusDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardEnrollmentServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Test
    void captureStoresUidOnlyWhileEnrollmentModeIsActive() {
        CardEnrollmentService cardEnrollmentService = new CardEnrollmentService(redisTemplate);

        when(redisTemplate.hasKey("access_card:enrollment:active")).thenReturn(true);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.getExpire("access_card:enrollment:active")).thenReturn(60L);

        AccessCardEnrollmentStatusDTO status = cardEnrollmentService.captureEnrollmentUid("  UID-001  ");

        verify(valueOperations, times(2)).set(anyString(), anyString(), any());
        assertThat(status.isActive()).isTrue();
        assertThat(status.getUid()).isNull();
    }

    @Test
    void captureDoesNothingWhenEnrollmentModeIsInactive() {
        CardEnrollmentService cardEnrollmentService = new CardEnrollmentService(redisTemplate);

        when(redisTemplate.hasKey("access_card:enrollment:active")).thenReturn(false);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.getExpire("access_card:enrollment:active")).thenReturn(-2L);

        AccessCardEnrollmentStatusDTO status = cardEnrollmentService.captureEnrollmentUid("UID-001");

        verify(valueOperations, never()).set(anyString(), anyString(), any());
        assertThat(status.isActive()).isFalse();
        assertThat(status.getExpiresInSeconds()).isZero();
    }
}

package com.hsware.cacs.service;

import com.hsware.cacs.dto.UserDTO;
import com.hsware.cacs.dto.UserUpdateDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccessCardRepository accessCardRepository;

    @Mock
    private DtoMapper dtoMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void updateInactivatesPreviousCardAndActivatesNewCard() {
        AccessCard previousCard = AccessCard.builder().id(1).status("ACTIVE").build();
        AccessCard nextCard = AccessCard.builder().id(2).status("INACTIVE").build();
        User user = User.builder().id(10).accessCard(previousCard).status("ACTIVE").build();
        UserDTO expectedDto = new UserDTO();

        when(userRepository.findByIdAndDeletedAtIsNull(10)).thenReturn(Optional.of(user));
        doAnswer(invocation -> {
            UserUpdateDTO ignoredDto = invocation.getArgument(0);
            User managedUser = invocation.getArgument(1);
            managedUser.setAccessCard(nextCard);
            return null;
        }).when(dtoMapper).updateUserFromDTO(any(UserUpdateDTO.class), any(User.class));
        when(accessCardRepository.findByIdAndDeletedAtIsNull(2)).thenReturn(Optional.of(nextCard));
        when(accessCardRepository.save(any(AccessCard.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(user)).thenReturn(user);
        when(dtoMapper.toUserDTO(user)).thenReturn(expectedDto);

        userService.update(10, new UserUpdateDTO());

        assertThat(previousCard.getStatus()).isEqualTo("INACTIVE");
        assertThat(nextCard.getStatus()).isEqualTo("ACTIVE");
    }
}

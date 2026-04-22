package com.hsware.cacs.service;

import com.hsware.cacs.dto.UserDTO;
import com.hsware.cacs.dto.UserProfileAssignmentDTO;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
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

    @Test
    void updateRejectsCardAlreadyAssignedToAnotherUser() {
        AccessCard nextCard = AccessCard.builder().id(2).status("INACTIVE").build();
        User currentUser = User.builder().id(10).status("ACTIVE").build();
        User assignedUser = User.builder().id(99).accessCard(nextCard).status("ACTIVE").build();

        when(userRepository.findByIdAndDeletedAtIsNull(10)).thenReturn(Optional.of(currentUser));
        doAnswer(invocation -> {
            User managedUser = invocation.getArgument(1);
            managedUser.setAccessCard(nextCard);
            return null;
        }).when(dtoMapper).updateUserFromDTO(any(UserUpdateDTO.class), any(User.class));
        when(accessCardRepository.findByIdAndDeletedAtIsNull(2)).thenReturn(Optional.of(nextCard));
        when(userRepository.findByAccessCard_IdAndDeletedAtIsNull(2)).thenReturn(Optional.of(assignedUser));

        assertThatThrownBy(() -> userService.update(10, new UserUpdateDTO()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("This card is already assigned to another user");
    }

    @Test
    void assignProfilesReplacesUserProfiles() {
        User user = User.builder().id(10).status("ACTIVE").build();
        UserDTO expectedDto = new UserDTO();
        UserProfileAssignmentDTO assignmentDTO = new UserProfileAssignmentDTO(java.util.Set.of(3, 7));

        when(userRepository.findByIdAndDeletedAtIsNull(10)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(dtoMapper.toUserDTO(user)).thenReturn(expectedDto);

        userService.assignProfiles(10, assignmentDTO);

        org.mockito.Mockito.verify(dtoMapper).updateUserFromDTO(
            argThat(dto -> dto.getProfileIds() != null && dto.getProfileIds().equals(java.util.Set.of(3, 7))),
            org.mockito.Mockito.same(user)
        );
    }

    @Test
    void assignProfilesAllowsClearingAllProfiles() {
        User user = User.builder().id(10).status("ACTIVE").build();
        UserDTO expectedDto = new UserDTO();
        UserProfileAssignmentDTO assignmentDTO = new UserProfileAssignmentDTO(java.util.Set.of());

        when(userRepository.findByIdAndDeletedAtIsNull(10)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(dtoMapper.toUserDTO(user)).thenReturn(expectedDto);

        userService.assignProfiles(10, assignmentDTO);

        org.mockito.Mockito.verify(dtoMapper).updateUserFromDTO(
            argThat(dto -> dto.getProfileIds() != null && dto.getProfileIds().isEmpty()),
            org.mockito.Mockito.same(user)
        );
    }

    @Test
    void assignProfilesPropagatesUnknownProfileValidation() {
        User user = User.builder().id(10).status("ACTIVE").build();

        when(userRepository.findByIdAndDeletedAtIsNull(10)).thenReturn(Optional.of(user));
        doAnswer(invocation -> {
            throw new IllegalArgumentException("Unknown profiles: [999]");
        }).when(dtoMapper).updateUserFromDTO(any(UserUpdateDTO.class), any(User.class));

        assertThatThrownBy(() -> userService.assignProfiles(10, new UserProfileAssignmentDTO(java.util.Set.of(999))))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Unknown profiles: [999]");
    }
}

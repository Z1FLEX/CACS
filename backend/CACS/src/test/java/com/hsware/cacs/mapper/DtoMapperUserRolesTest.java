package com.hsware.cacs.mapper;

import com.hsware.cacs.dto.UserCreateDTO;
import com.hsware.cacs.dto.UserUpdateDTO;
import com.hsware.cacs.entity.Role;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.RoleRepository;
import com.hsware.cacs.repository.ScheduleRepository;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.repository.ZoneRepository;
import com.hsware.cacs.repository.ZoneTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DtoMapperUserRolesTest {

    @Mock private AccessCardRepository accessCardRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private ZoneRepository zoneRepository;
    @Mock private ZoneTypeRepository zoneTypeRepository;
    @Mock private DoorRepository doorRepository;
    @Mock private UserRepository userRepository;
    @Mock private ScheduleRepository scheduleRepository;

    private DtoMapper dtoMapper;

    @BeforeEach
    void setUp() {
        dtoMapper = new DtoMapper(
            accessCardRepository,
            profileRepository,
            roleRepository,
            zoneRepository,
            zoneTypeRepository,
            doorRepository,
            userRepository,
            scheduleRepository
        );
    }

    @Test
    void toUserAssignsRequestedRolesFromRepository() {
        Role adminRole = Role.builder().id(1).name("ADMIN").build();
        Role userRole = Role.builder().id(2).name("USER").build();
        when(roleRepository.findByNameInAndDeletedAtIsNull(anyCollection()))
            .thenReturn(List.of(adminRole, userRole));

        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("test@cacs.com");
        dto.setPassword("secret");
        dto.setRoles(Set.of("admin", "user"));

        User user = dtoMapper.toUser(dto);

        assertThat(user.getRoles())
            .extracting(Role::getName)
            .containsExactlyInAnyOrder("ADMIN", "USER");
        assertThat(user.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void toUserDefaultsToUserRoleWhenRolesMissing() {
        Role userRole = Role.builder().id(2).name("USER").build();
        when(roleRepository.findByNameInAndDeletedAtIsNull(anyCollection()))
            .thenReturn(List.of(userRole));

        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("default@cacs.com");
        dto.setPassword("secret");
        dto.setRoles(null);

        User user = dtoMapper.toUser(dto);

        assertThat(user.getRoles())
            .extracting(Role::getName)
            .containsExactly("USER");
    }

    @Test
    void updateUserFromDtoReplacesRoles() {
        Role responsableRole = Role.builder().id(3).name("RESPONSABLE").build();
        when(roleRepository.findByNameInAndDeletedAtIsNull(anyCollection()))
            .thenReturn(List.of(responsableRole));

        User user = new User();
        user.setRoles(Set.of(Role.builder().id(1).name("USER").build()));

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setRoles(Set.of("responsable"));

        dtoMapper.updateUserFromDTO(dto, user);

        assertThat(user.getRoles())
            .extracting(Role::getName)
            .containsExactly("RESPONSABLE");
    }

    @Test
    void toUserRejectsUnknownRoles() {
        when(roleRepository.findByNameInAndDeletedAtIsNull(anyCollection()))
            .thenReturn(List.of(Role.builder().id(1).name("ADMIN").build()));

        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("invalid@cacs.com");
        dto.setRoles(Set.of("admin", "ghost"));

        assertThatThrownBy(() -> dtoMapper.toUser(dto))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Unknown roles: GHOST");
    }
}

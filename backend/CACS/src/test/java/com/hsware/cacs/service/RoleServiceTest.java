package com.hsware.cacs.service;

import com.hsware.cacs.dto.RoleCreateDTO;
import com.hsware.cacs.dto.RoleDTO;
import com.hsware.cacs.entity.Role;
import com.hsware.cacs.repository.RoleRepository;
import com.hsware.cacs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock private RoleRepository roleRepository;
    @Mock private UserRepository userRepository;

    private RoleService roleService;

    @BeforeEach
    void setUp() {
        roleService = new RoleService(roleRepository, userRepository);
    }

    @Test
    void createNormalizesRoleNameToUppercase() {
        Role savedRole = Role.builder()
            .id(10)
            .name("AUDITOR")
            .description("Audit access")
            .createdAt(Instant.now())
            .build();

        when(roleRepository.findByNameIgnoreCaseAndDeletedAtIsNull("AUDITOR")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(savedRole);

        RoleDTO created = roleService.create(new RoleCreateDTO("auditor", "Audit access"));

        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getName()).isEqualTo("AUDITOR");
        assertThat(created.getName()).isEqualTo("AUDITOR");
    }

    @Test
    void deleteRejectsAssignedRoles() {
        Role role = Role.builder().id(3).name("ADMIN").build();
        when(roleRepository.findByIdAndDeletedAtIsNull(3)).thenReturn(Optional.of(role));
        when(userRepository.countByRoles_IdAndDeletedAtIsNull(3)).thenReturn(2L);

        assertThatThrownBy(() -> roleService.delete(3))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("still assigned");
    }

    @Test
    void deleteSoftDeletesUnassignedRoles() {
        Role role = Role.builder().id(4).name("AUDITOR").build();
        when(roleRepository.findByIdAndDeletedAtIsNull(4)).thenReturn(Optional.of(role));
        when(userRepository.countByRoles_IdAndDeletedAtIsNull(4)).thenReturn(0L);

        boolean deleted = roleService.delete(4);

        assertThat(deleted).isTrue();
        assertThat(role.getDeletedAt()).isNotNull();
        verify(roleRepository).save(role);
    }
}

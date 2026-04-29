package com.hsware.cacs.service;

import com.hsware.cacs.dto.RoleCreateDTO;
import com.hsware.cacs.dto.RoleDTO;
import com.hsware.cacs.dto.RoleUpdateDTO;
import com.hsware.cacs.entity.Role;
import com.hsware.cacs.repository.RoleRepository;
import com.hsware.cacs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleDTO> findAll() {
        return roleRepository.findByDeletedAtIsNull().stream()
            .map(this::toRoleDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<RoleDTO> findById(Integer id) {
        return roleRepository.findByIdAndDeletedAtIsNull(id).map(this::toRoleDTO);
    }

    @Transactional
    public RoleDTO create(RoleCreateDTO dto) {
        String normalizedName = normalizeRoleName(dto.getName());
        ensureRoleNameAvailable(normalizedName, null);

        Role role = Role.builder()
            .name(normalizedName)
            .description(normalizeDescription(dto.getDescription()))
            .build();

        return toRoleDTO(roleRepository.save(role));
    }

    @Transactional
    public Optional<RoleDTO> update(Integer id, RoleUpdateDTO dto) {
        Optional<Role> existing = roleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();

        Role role = existing.get();
        if (dto.getName() != null) {
            String normalizedName = normalizeRoleName(dto.getName());
            ensureRoleNameAvailable(normalizedName, role.getId());
            role.setName(normalizedName);
        }
        if (dto.getDescription() != null) {
            role.setDescription(normalizeDescription(dto.getDescription()));
        }

        return Optional.of(toRoleDTO(roleRepository.save(role)));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Role> existing = roleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;

        long assignedUsers = userRepository.countByRoles_IdAndDeletedAtIsNull(id);
        if (assignedUsers > 0) {
            throw new IllegalArgumentException("Cannot delete a role that is still assigned to users");
        }

        Role role = existing.get();
        role.setDeletedAt(Instant.now());
        roleRepository.save(role);
        return true;
    }

    private RoleDTO toRoleDTO(Role role) {
        return new RoleDTO(
            role.getId(),
            role.getName(),
            role.getDescription(),
            role.getCreatedAt()
        );
    }

    private void ensureRoleNameAvailable(String normalizedName, Integer currentRoleId) {
        roleRepository.findByNameIgnoreCaseAndDeletedAtIsNull(normalizedName).ifPresent(existingRole -> {
            boolean isSameRole = currentRoleId != null && currentRoleId.equals(existingRole.getId());
            if (!isSameRole) {
                throw new IllegalArgumentException("Role name already exists: " + normalizedName);
            }
        });
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name is required");
        }
        return roleName.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

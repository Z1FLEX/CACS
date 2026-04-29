package com.hsware.cacs.service;

import com.hsware.cacs.dto.ProfileDTO;
import com.hsware.cacs.dto.ProfileCreateDTO;
import com.hsware.cacs.dto.ProfileUpdateDTO;
import com.hsware.cacs.entity.Profile;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<ProfileDTO> findAll() {
        return profileRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toProfileDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ProfileDTO> findById(Integer id) {
        return profileRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toProfileDTO);
    }

    @Transactional
    public ProfileDTO create(ProfileCreateDTO profileCreateDTO) {
        ensureProfileNameAvailable(profileCreateDTO.getName(), null);
        Profile profile = dtoMapper.toProfile(profileCreateDTO);
        profile = profileRepository.save(profile);
        return dtoMapper.toProfileDTO(profile);
    }

    @Transactional
    public Optional<ProfileDTO> update(Integer id, ProfileUpdateDTO profileUpdateDTO) {
        Optional<Profile> existing = profileRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Profile profile = existing.get();
        if (profileUpdateDTO.getName() != null) {
            ensureProfileNameAvailable(profileUpdateDTO.getName(), id);
        }
        dtoMapper.updateProfileFromDTO(profileUpdateDTO, profile);
        profile = profileRepository.save(profile);
        return Optional.of(dtoMapper.toProfileDTO(profile));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Profile> existing = profileRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        if (userRepository.countByProfiles_IdAndDeletedAtIsNull(id) > 0) {
            throw new IllegalArgumentException("Cannot delete a profile that is still assigned to users");
        }
        Profile p = existing.get();
        p.setDeletedAt(java.time.Instant.now());
        profileRepository.save(p);
        return true;
    }

    private void ensureProfileNameAvailable(String name, Integer currentProfileId) {
        if (name == null || name.isBlank()) {
            return;
        }

        boolean exists = currentProfileId == null
            ? profileRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name.trim())
            : profileRepository.existsByNameIgnoreCaseAndDeletedAtIsNullAndIdNot(name.trim(), currentProfileId);

        if (exists) {
            throw new IllegalArgumentException("Profile name already exists");
        }
    }

}

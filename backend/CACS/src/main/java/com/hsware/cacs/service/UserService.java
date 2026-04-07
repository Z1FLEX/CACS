package com.hsware.cacs.service;

import com.hsware.cacs.dto.UserDTO;
import com.hsware.cacs.dto.UserCreateDTO;
import com.hsware.cacs.dto.UserUpdateDTO;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UserDTO> findById(Integer id) {
        return userRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toUserDTO);
    }

    @Transactional
    public UserDTO create(UserCreateDTO userCreateDTO) {
        User user = dtoMapper.toUser(userCreateDTO);
        user = userRepository.save(user);
        return dtoMapper.toUserDTO(user);
    }

    @Transactional
    public Optional<UserDTO> update(Integer id, UserUpdateDTO userUpdateDTO) {
        Optional<User> existing = userRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        User user = existing.get();
        dtoMapper.updateUserFromDTO(userUpdateDTO, user);
        user = userRepository.save(user);
        return Optional.of(dtoMapper.toUserDTO(user));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<User> existing = userRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        User u = existing.get();
        u.setDeletedAt(java.time.Instant.now());
        u.setStatus("INACTIVE");
        userRepository.save(u);
        return true;
    }

}

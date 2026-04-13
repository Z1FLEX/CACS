package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    List<Role> findByDeletedAtIsNull();

    Optional<Role> findByIdAndDeletedAtIsNull(Integer id);

    Optional<Role> findByNameAndDeletedAtIsNull(String name);

    List<Role> findByNameInAndDeletedAtIsNull(Iterable<String> names);

    Optional<Role> findByNameIgnoreCase(String name);
}

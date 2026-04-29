package com.hsware.cacs.repository;

import com.hsware.cacs.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    @EntityGraph(attributePaths = {"roles"})
    List<User> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByIdAndDeletedAtIsNull(Integer id);

    Optional<User> findByAccessCard_IdAndDeletedAtIsNull(Integer accessCardId);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNullAndIdNot(String email, Integer id);

    /** Users responsible for this zone (zone_responsibility join) */
    java.util.List<User> findByResponsibleZones_IdAndDeletedAtIsNull(Integer zoneId);

    long countByRoles_IdAndDeletedAtIsNull(Integer roleId);

    long countByProfiles_IdAndDeletedAtIsNull(Integer profileId);

    @EntityGraph(attributePaths = {
        "accessCard",
        "profiles",
        "profiles.zones",
        "profiles.schedules"
    })
    Optional<User> findByAccessCard_NumAndAccessCard_DeletedAtIsNullAndDeletedAtIsNull(String cardHash);
}

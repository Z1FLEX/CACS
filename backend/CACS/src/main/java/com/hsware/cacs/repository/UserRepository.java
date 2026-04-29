package com.hsware.cacs.repository;

import com.hsware.cacs.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    @EntityGraph(attributePaths = {"roles", "accessCard", "profiles"})
    List<User> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"roles", "accessCard", "profiles"})
    Optional<User> findByIdAndDeletedAtIsNull(Integer id);

    Optional<User> findByAccessCard_IdAndDeletedAtIsNull(Integer accessCardId);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNullAndIdNot(String email, Integer id);

    /** Users responsible for this zone (zone_responsibility join) */
    java.util.List<User> findByResponsibleZones_IdAndDeletedAtIsNull(Integer zoneId);

    @EntityGraph(attributePaths = {"accessCard"})
    List<User> findByAccessCard_IdInAndDeletedAtIsNull(Collection<Integer> accessCardIds);

    @Query("""
        SELECT DISTINCT u
        FROM User u
        JOIN FETCH u.responsibleZones z
        WHERE z.id IN :zoneIds
          AND u.deletedAt IS NULL
        """)
    List<User> findManagersByResponsibleZoneIds(@Param("zoneIds") Collection<Integer> zoneIds);

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

package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {

    @Query("SELECT DISTINCT z FROM Zone z LEFT JOIN FETCH z.zoneType WHERE z.deletedAt IS NULL")
    List<Zone> findByDeletedAtIsNull();

    @Query("SELECT DISTINCT z FROM Zone z LEFT JOIN FETCH z.zoneType WHERE z.id = :id AND z.deletedAt IS NULL")
    Optional<Zone> findByIdAndDeletedAtIsNull(@Param("id") Integer id);
}

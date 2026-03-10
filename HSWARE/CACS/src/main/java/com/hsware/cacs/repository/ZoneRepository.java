package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {

    List<Zone> findByDeletedAtIsNull();

    Optional<Zone> findByIdAndDeletedAtIsNull(Integer id);
}

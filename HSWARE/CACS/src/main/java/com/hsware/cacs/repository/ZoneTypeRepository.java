package com.hsware.cacs.repository;

import com.hsware.cacs.entity.ZoneType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ZoneTypeRepository extends JpaRepository<ZoneType, Integer> {

    List<ZoneType> findByDeletedAtIsNull();
}

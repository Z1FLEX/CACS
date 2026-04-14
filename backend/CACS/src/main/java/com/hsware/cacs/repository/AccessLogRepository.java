package com.hsware.cacs.repository;

import com.hsware.cacs.entity.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessLogRepository extends JpaRepository<AccessLog, Integer> {
}

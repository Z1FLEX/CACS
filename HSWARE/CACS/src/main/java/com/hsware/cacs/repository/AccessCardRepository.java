package com.hsware.cacs.repository;

import com.hsware.cacs.entity.AccessCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccessCardRepository extends JpaRepository<AccessCard, Integer> {

    List<AccessCard> findByDeletedAtIsNull();

    Optional<AccessCard> findByIdAndDeletedAtIsNull(Integer id);

    Optional<AccessCard> findByUidAndDeletedAtIsNull(String uid);
}

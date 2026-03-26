package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DealerRepository extends JpaRepository<Dealer, Long> {
    boolean existsByDealerCode(String dealerCode);
    boolean existsByGstNumber(String gstNumber);
    Optional<Dealer> findByDealerCode(String dealerCode);
}

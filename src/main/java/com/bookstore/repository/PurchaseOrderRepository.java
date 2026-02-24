package com.bookstore.repository;

import com.bookstore.model.PurchaseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends MongoRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findBySupplierId(String supplierId);
    List<PurchaseOrder> findByStatus(String status);
}

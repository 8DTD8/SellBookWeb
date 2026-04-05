package com.bookstore.repository;

import com.bookstore.model.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends MongoRepository<Supplier, String> {
    List<Supplier> findByActive(Boolean active);
}

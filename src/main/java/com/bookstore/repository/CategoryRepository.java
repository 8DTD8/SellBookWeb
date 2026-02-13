package com.bookstore.repository;

import com.bookstore.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByActive(Boolean active);
    Boolean existsByName(String name);
}

package com.sushama.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sushama.entities.SubCategory;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
	
    boolean existsByNameIgnoreCaseAndCategory_Id(String name, Long categoryId);
    List<SubCategory> findByCategory_Id(Long categoryId);
}
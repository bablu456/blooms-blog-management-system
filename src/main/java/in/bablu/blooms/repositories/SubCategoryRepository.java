package in.bablu.blooms.repositories;

import in.bablu.blooms.models.SubCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SubCategoryRepository extends MongoRepository<SubCategory,String> {

    List<SubCategory> findByCategoryId(String categoryId);
}

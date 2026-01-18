package in.bablu.blooms.services;

import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.CategoryMapping;
import in.bablu.blooms.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {


    @Autowired
    public CategoryRepository categoryRepository;

    public Category createCategory(Category category){

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories(){
        return categoryRepository.findAll();
    }

    public boolean deleteCategory(String id){
        if(categoryRepository.existsById(id)){
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

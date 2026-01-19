package in.bablu.blooms.services;


import in.bablu.blooms.models.SubCategory;
import in.bablu.blooms.repositories.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubCategoryService {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    // Create
    public SubCategory createSubCategory(SubCategory subCategory){

        return subCategoryRepository.save(subCategory);
    }

    //Get By Category Id
    public List<SubCategory> getSubCategoriesByCategory(String categoryId){
        return subCategoryRepository.findByCategoryId(categoryId);
    }

    //Delete
    public boolean deleteSubCategory(String id){
        if(subCategoryRepository.existsById(id)){
            subCategoryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //get All
    public List<SubCategory> getAll(){
        return subCategoryRepository.findAll();
    }
}

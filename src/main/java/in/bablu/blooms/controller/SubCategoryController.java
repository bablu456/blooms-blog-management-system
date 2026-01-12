package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.SubCategoryRequest;
import in.bablu.blooms.dto.SubCategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.SubCategory;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class SubCategoryController {

    //--- 1. Create subcategory ---
    public void createSubCategory(SubCategoryRequest request){
        // Step A: Validation - Kya ya Baap (Category) exist karta hai?
        boolean categoryExists = false;
        List<Category> allCategories = Database.getInstance().getCategoryList();

        for(Category cat : allCategories){
            if(cat.getId().equals(request.getCategoryId()) && cat.isActive()){
                categoryExists = true;
                break;
            }
        }
        if(!categoryExists){
            System.out.println("ERROR: Category ID "+request.getCategoryId());
            return;
        }

        //Step B: Agar Category hai, To Sub-Category banayein
        SubCategory subCategory = new SubCategory();
        subCategory.setId(String.valueOf(System.currentTimeMillis()));

        //YAHAN CONNCTION BAN RAHA HAI
        subCategory.setCategoryId(request.getCategoryId());

        subCategory.setName(request.getName());
        subCategory.setDescription(request.getDescription());

        //System Default Data
        subCategory.setActive(true);
        subCategory.setStatus(Status.PUBLISHED.getDisplayName());
        subCategory.setCreatedBy("Admin");
        subCategory.setCreatedDTTM(Timestamp.from(Instant.now()));

        Database.getInstance().getSubCategoryList().add(subCategory);
        System.out.println("Controller: Sub-Category Created -> " + subCategory.getName());
    }
    // --- 2. Read By Category (Filter Karna)
    // User bolega: "Is category id ka maal dikaho"
    public List<SubCategoryResponse> getSubCategoriesByCategoryId(String categoryId){

        //1. DataBase ke Sari SubCategory Uthao
        List<SubCategory> allSubCategories = Database.getInstance().getSubCategoryList();

        //2. Ek Khali list banao result ke liye
        List<SubCategoryResponse> result = new ArrayList<>();

        //Filter Logic(Channi lagana)
        for(SubCategory sub : allSubCategories){
            if(sub.isActive() && sub.getCategoryId().equals(categoryId)){

                // Match mil gaya! Response DTO banao
                SubCategoryResponse response = new SubCategoryResponse(sub.getId(),sub.getCategoryId(),sub.getName(),sub.getDescription());

                result.add(response);
            }
        }
        return result;
    }

}

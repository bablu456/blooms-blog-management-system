package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.CategoryRequest;
import in.bablu.blooms.dto.CategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CategoryController {
    //---1. Create Category---
    public void createCategory(CategoryRequest categoryRequest){
        // Logic to create a new category using data from categoryRequest
        Category category = new Category();

        // Step B: Request (Lifafa) Se Data Nikal Kar Model Me Dala
        category.setName(categoryRequest.getTitle());
        category.setDescription(categoryRequest.getDesc());
        category.setImageUrl(categoryRequest.getcUrl());

        // Step C: System Generated Data (jo User nahi deta)
        category.setStatus(Status.PUBLISHED.getDisplayName());

        //Unique ID (Current tiem in miliseconds - Jugaad for unique ID)
        category.setId(String.valueOf(System.currentTimeMillis()));

        category.setCreatedBy("Admin");
        category.setActive(true);
        category.setCreatedDTTM(LocalDateTime.now()); // Abhi ka Time

        //Step D: Database (Fridge) me Save karna
        //Singelton Pattern ka use karke list mangwayi aur add kar diya
        Database database = Database.getInstance();
        database.getCategoryList().add(category);

        System.out.println("Controller: Category Created -> " + category.getName());
    }

    //---2. Read Single (Ek Item dhundhna)---
    public CategoryResponse getCategory(String categoryId){
        //Database se Puri list nikali
        List<Category> categoryList = Database.getInstance().getCategoryList();

        //loop chala kar ID dhundhi
        for(Category category : categoryList){
            if(category.getId().equals(categoryId)){
                // Agar mil gaya, to model ko response DTO me convert kiya (plate sajayi)
                CategoryResponse categoryResponse = new CategoryResponse();
                categoryResponse.setcUrl(category.getImageUrl());
                categoryResponse.setDesc(category.getDescription());
                categoryResponse.setTitle(category.getName());
                categoryResponse.setId(category.getId());

                return categoryResponse; // return kar diya
            }
        }
        return null; // agar Id nahi mili
    }
    // --- 3. READ ALL (Sab kuch dikhana) ---
    public List<CategoryResponse> getCategories(){
        List<Category> categoryList = Database.getInstance().getCategoryList();
        List<CategoryResponse> categoryResponses = new ArrayList<>();

        for(Category category : categoryList){
            if(category.isActive()){
                //Mapping: Model -> Response
                CategoryResponse categoryResponse = new CategoryResponse();
                categoryResponse.setId(category.getId());
                categoryResponse.setTitle(category.getName());
                categoryResponse.setDesc(category.getDescription());
                categoryResponse.setcUrl(category.getImageUrl());

                categoryResponses.add(categoryResponse);
            }
        }
        return categoryResponses;
    }
    // --- 4. DELETE (Soft Delete) ---
    public boolean deleteCategory(String categoryId){
        List<Category> categoryList = Database.getInstance().getCategoryList();

        for(Category cat : categoryList){
            if(cat.getId().equals(categoryId)){
                // Hard Delete (Database se uda dena) - hum ye nhi karenge
                //categoryList.remove(cat);

                //soft Delete (sirf chhupa dena)
                cat.setActive(false);
                System.out.println("Controller: Category Deleted -> " + cat.getName());
                return  true;
            }
        }
        return false; // agar Id nahi mili
    }
    // ---- 5 Update (Edit Karna) ----
    public CategoryResponse updateCategory(CategoryRequest categoryRequest){
        CategoryResponse categoryResponse = new CategoryResponse();

        //Validation: Agar ID hi nhi hai to update kiska karain ?
        if(categoryRequest.getId() == null){
            return categoryResponse;
        }
        List<Category> categoryResponses = Database.getInstance().getCategoryList();

        for(Category category : categoryResponses){
            if(category.getId().equals(categoryRequest.getId())){
                category.setName(categoryRequest.getTitle());
                category.setDescription(categoryRequest.getDesc());
                category.setImageUrl(categoryRequest.getcUrl());

                //Response Ready kiya wapas bhejne ke liye
                categoryResponse.setDesc(category.getDescription());
                categoryResponse.setId(category.getId());
                categoryResponse.setcUrl(category.getImageUrl());
                categoryResponse.setTitle(category.getName());

                System.out.println("Controller: Category Updated -> " + category.getName());
                return categoryResponse;
            }
        }
        return categoryResponse;
    }

}

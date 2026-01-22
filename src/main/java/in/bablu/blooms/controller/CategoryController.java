package in.bablu.blooms.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.CategoryRequest;
import in.bablu.blooms.dto.CategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.repositories.CategoryRepository;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    public CategoryRepository categoryRepository;

    @PostMapping
    public  CategoryResponse createCategory(@RequestBody CategoryRequest request){
        // Logic to create a new ca tegory using data from request
        Category category = new Category();

        category.setName(request.getTitle());
        category.setDescription(request.getDesc());
        category.setImageUrl(request.getcUrl());

        // Step C: System Generated Data (jo User nahi deta)
        category.setStatus(Status.PUBLISHED.getDisplayName());

        //Unique ID (Current tiem in miliseconds - Jugaad for unique ID)
        category.setId(String.valueOf(System.currentTimeMillis()));


        category.setCreatedBy("Admin");
        category.setActive(true);
        category.setCreatedDTTM(LocalDateTime.now()); // Abhi ka Time

        //Step D: Database (Fridge) me Save karna
        //Singelton Pattern ka use karke list mangwayi aur add kar diya
        Category savedCategory = categoryRepository.save(category);
        return new CategoryResponse(savedCategory.getId(),savedCategory.getName(),savedCategory.getDescription(),savedCategory.getImageUrl());
    }

    //---2. Read Single (Ek Item dhundhna)---
    @GetMapping
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
    @GetMapping("/all")
    public List<CategoryResponse> getCategories(){
       List<Category> categories = categoryRepository.findAll();

       List<CategoryResponse> responses = new ArrayList<>();

       for(Category c : categories){
           responses.add(new CategoryResponse(c.getId(),c.getName(),c.getDescription(),c.getImageUrl()));
       }
        return responses;
    }
    // --- 4. DELETE (Soft Delete) ---
    @DeleteMapping("/{id}")
    public boolean deleteCategory(@PathVariable String id){
        if(categoryRepository.existsById(id)){
            categoryRepository.deleteById(id);
            return true;
        }
        return false; // agar Id nahi mili
    }
    // ---- 5 Update (Edit Karna) ----
//    @PutMapping
//    public CategoryResponse updateCategory(@RequestBody CategoryRequest categoryRequest){
//        CategoryResponse categoryResponse = new CategoryResponse();
//
//        //Validation: Agar ID hi nhi hai to update kiska karain ?
//        if(categoryRequest.getId() == null){
//            return categoryResponse;
//        }
//        List<Category> categoryResponses = Database.getInstance().getCategoryList();
//
//        for(Category category : categoryResponses){
//            if(category.getId().equals(categoryRequest.getId())){
//                category.setName(categoryRequest.getTitle());
//                category.setDescription(categoryRequest.getDesc());
//                category.setImageUrl(categoryRequest.getcUrl());
//
//                //Response Ready kiya wapas bhejne ke liye
//                categoryResponse.setDesc(category.getDescription());
//                categoryResponse.setId(category.getId());
//                categoryResponse.setcUrl(category.getImageUrl());
//                categoryResponse.setTitle(category.getName());
//
//                System.out.println("Controller: Category Updated -> " + category.getName());
//                return categoryResponse;
//            }
//        }
//        return categoryResponse;
//    }

}

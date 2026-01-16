package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.SubCategoryRequest;
import in.bablu.blooms.dto.SubCategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.SubCategory;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/subcategory")
public class SubCategoryController {

    //--- 1. Create subcategory ---
    @PostMapping
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
    @GetMapping
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

    public SubCategoryResponse getSubCategory(String subCategoryId){
        List<SubCategory> list = Database.getInstance().getSubCategoryList();

        for(SubCategory sub : list){
            if(sub.getId().equals(subCategoryId) && sub.isActive()){
                return mapToResponse(sub);
            }
        }
        return null;
    }

    @PutMapping
    public SubCategoryResponse updateSubCategory(SubCategoryRequest request){
        if(request.getId() == null){
            System.out.println("❌ Error: ID is required for update");
            return null;
        }
        List<SubCategory> list = Database.getInstance().getSubCategoryList();
        for(SubCategory sub : list){
            if(sub.getId().equals(request.getId())){

                // Hum sirf Name aur Desc update kar rahe hain
                // (Parent Category change karna thoda complex hota hai, abhi avoid karte hain)
                sub.setName(request.getName());
                sub.setDescription(request.getDescription());

                System.out.println("✅ SubCategory Updated: \" + sub.getName()");
                return mapToResponse(sub);
            }
        }
        System.out.println("❌ Error: SubCategory nahi mili update karne ke liye.");
        return null;
    }
    // --- 5. DELETE (Soft Delete) ---
    @DeleteMapping
    public boolean deleteSubCategory(String subCategoryId) {
        List<SubCategory> list = Database.getInstance().getSubCategoryList();

        for (SubCategory sub : list) {
            if (sub.getId().equals(subCategoryId)) {
                sub.setActive(false); // Soft delete (Batti bujha di)
                System.out.println("🗑️ SubCategory Deleted (Soft): " + sub.getName());
                return true;
            }
        }
        System.out.println("❌ Error: Delete karne ke liye ID nahi mili.");
        return false;
    }

    // --- HELPER METHOD (Code duplication bachane ke liye) ---
    // Ye method Model ko Response DTO me convert karta hai
    private SubCategoryResponse mapToResponse(SubCategory sub) {
        return new SubCategoryResponse(
                sub.getId(),
                sub.getCategoryId(),
                sub.getName(),
                sub.getDescription()
        );
    }


    // Read All SubCategory
    @GetMapping("/all")
    public List<SubCategoryResponse> viewAll(){
        List<SubCategory> subCategoryList = Database.getInstance().getSubCategoryList();
        List<SubCategoryResponse> subCategories = new ArrayList<>();

        for(SubCategory subCategory : subCategoryList){
            SubCategoryResponse sub = new SubCategoryResponse();
            sub.setDescription(subCategory.getDescription());
            sub.setCategoryId(subCategory.getCategoryId());
            sub.setId(subCategory.getId());
            sub.setName(subCategory.getName());

            subCategories.add(sub);
        }
        return subCategories;
    }

}

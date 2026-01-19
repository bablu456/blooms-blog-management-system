package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.SubCategoryRequest;
import in.bablu.blooms.dto.SubCategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.SubCategory;
import in.bablu.blooms.repositories.SubCategoryRepository;
import in.bablu.blooms.services.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/subcategory")
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    @PostMapping
    public SubCategoryResponse create(@RequestBody SubCategoryRequest request){

        SubCategory subCategory = new SubCategory();
        subCategory.setName(request.getName());
        subCategory.setDescription(request.getDescription());
        subCategory.setCategoryId(request.getCategoryId());

        SubCategory saved  = subCategoryService.createSubCategory(subCategory);

        return new SubCategoryResponse(saved.getId(),saved.getCategoryId(),saved.getName(),saved.getDescription());
    }

    // Get by Category
    @GetMapping("/{categoryId}")
    public List<SubCategoryResponse> getCategory(@PathVariable String categoryId){
        List<SubCategory> list = subCategoryService.getSubCategoriesByCategory(categoryId);

        List<SubCategoryResponse> responses = new ArrayList<>();
        for(SubCategory s : list){
            SubCategoryResponse res = new SubCategoryResponse();
            res.setId(s.getId());
            res.setName(s.getName());
            res.setDescription(s.getDescription());
            res.setCategoryId(s.getCategoryId());
            responses.add(res);
        }
        return responses;
    }

    // Del
    @DeleteMapping("/{id}")
    public boolean dalete(@PathVariable String id){
        return subCategoryService.deleteSubCategory(id);
    }



    //--- 1. Create subcategory ---
//    @PostMapping
//    public SubCategoryResponse createSubCategory(@RequestBody SubCategoryRequest request){
//
//        SubCategory subCategory = new SubCategory();
//
//        subCategory.setName(request.getName());
//        subCategory.setCategoryId(request.getCategoryId());
//        subCategory.setDescription(request.getDescription());
//
//
////        boolean categoryExists = false;
////        List<Category> allCategories = Database.getInstance().getCategoryList();
////
////        for(Category cat : allCategories){
////            if(cat.getId().equals(request.getCategoryId()) && cat.isActive()){
////                categoryExists = true;
////                break;
////            }
////        }
////        if(!categoryExists){
////            System.out.println("ERROR: Category ID "+request.getCategoryId());
////            return;
////        }
//
//        //Step B: Agar Category hai, To Sub-Category banayein
////        SubCategory subCategory = new SubCategory();
//        subCategory.setId(String.valueOf(System.currentTimeMillis()));
//
//        SubCategory saved = subCategoryRepository.save(subCategory);
//
//        //YAHAN CONNCTION BAN RAHA HAI
////        subCategory.setCategoryId(request.getCategoryId());
////
////        subCategory.setName(request.getName());
////        subCategory.setDescription(request.getDescription());
////
////        //System Default Data
////        subCategory.setActive(true);
////        subCategory.setStatus(Status.PUBLISHED.getDisplayName());
////        subCategory.setCreatedBy("Admin");
////        subCategory.setCreatedDTTM(Timestamp.from(Instant.now()));
////
////        Database.getInstance().getSubCategoryList().add(subCategory);
////        System.out.println("Controller: Sub-Category Created -> " + subCategory.getName());
//
//        return new SubCategoryResponse(saved.getId(), saved.getCategoryId(),saved.getName(),saved.getDescription());
//    }
//    // --- 2. Read By Category (Filter Karna)
//    @GetMapping("/category/{categoryId}")
//
//    public List<SubCategoryResponse> getSubCategoriesByCategoryId(String categoryId){
//
//        List<SubCategory> allSubCategories = subCategoryRepository.findByCategoryId(categoryId);
//        List<SubCategoryResponse> result = new ArrayList<>();
//
//        for(SubCategory sub : allSubCategories) {
//             result.add(new SubCategoryResponse(sub.getId(), sub.getCategoryId(), sub.getName(), sub.getDescription()));
//        }
//        return result;
//    }
//
//    public SubCategoryResponse getSubCategory(String subCategoryId){
//        List<SubCategory> list = Database.getInstance().getSubCategoryList();
//
//        for(SubCategory sub : list){
//            if(sub.getId().equals(subCategoryId) && sub.isActive()){
//                return mapToResponse(sub);
//            }
//        }
//        return null;
//    }
//
//    @PutMapping
//    public SubCategoryResponse updateSubCategory(SubCategoryRequest request){
//        if(request.getId() == null){
//            System.out.println("❌ Error: ID is required for update");
//            return null;
//        }
//        List<SubCategory> list = Database.getInstance().getSubCategoryList();
//        for(SubCategory sub : list){
//            if(sub.getId().equals(request.getId())){
//
//                // Hum sirf Name aur Desc update kar rahe hain
//                // (Parent Category change karna thoda complex hota hai, abhi avoid karte hain)
//                sub.setName(request.getName());
//                sub.setDescription(request.getDescription());
//
//                System.out.println("✅ SubCategory Updated: \" + sub.getName()");
//                return mapToResponse(sub);
//            }
//        }
//        System.out.println("❌ Error: SubCategory nahi mili update karne ke liye.");
//        return null;
//    }
//    // --- 5. DELETE (Soft Delete) ---
//    @DeleteMapping("/{subCategoryId}")
//    public boolean deleteSubCategory(@PathVariable String subCategoryId) {
//        if(subCategoryRepository.existsById(subCategoryId)){
//            subCategoryRepository.deleteById(subCategoryId);
//            return true;
//        }
//        return false;
//    }
//
//    // --- HELPER METHOD (Code duplication bachane ke liye) ---
//    // Ye method Model ko Response DTO me convert karta hai
//    private SubCategoryResponse mapToResponse(SubCategory sub) {
//        return new SubCategoryResponse(
//                sub.getId(),
//                sub.getCategoryId(),
//                sub.getName(),
//                sub.getDescription()
//        );
//    }
//
//
//    // Read All SubCategory
//    @GetMapping("/all")
//    public List<SubCategoryResponse> viewAll(){
//        List<SubCategory> subCategoryList = subCategoryRepository.findAll();
//
//        List<SubCategoryResponse> subCategories = new ArrayList<>();
//
//        for(SubCategory subCategory : subCategoryList){
//            SubCategoryResponse sub = new SubCategoryResponse();
//            sub.setDescription(subCategory.getDescription());
//            sub.setCategoryId(subCategory.getCategoryId());
//            sub.setId(subCategory.getId());
//            sub.setName(subCategory.getName());
//
//            subCategories.add(sub);
//        }
//        return subCategories;
//    }
}

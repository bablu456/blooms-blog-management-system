package in.bablu.blooms;

import in.bablu.blooms.controller.CategoryController;
import in.bablu.blooms.controller.SubCategoryController;
import in.bablu.blooms.dto.CategoryRequest;
import in.bablu.blooms.dto.CategoryResponse;
import in.bablu.blooms.dto.SubCategoryRequest;
import in.bablu.blooms.dto.SubCategoryResponse;

import java.util.List;

public class UiClient {
    public static void main(String[] args){
        System.out.println("--- UI Client Started ---");
//        // 1. Controller (Waiter) ko bulaya
//        CategoryController categoryController = new CategoryController();
//
//        // 2. CREATE: Ek nayi Request banayi aur Controller ko di
//        System.out.println("Step 1: Creating Categories...");
//
//        CategoryRequest req1 = new CategoryRequest(
//                "Technology",
//                "All about Java and Coding",
//                "https://tech-image.com/java.png"
//        );
//        categoryController.createCategory(req1);
//
//        CategoryRequest req2 = new CategoryRequest(
//                "Health",
//                "Fitness and Diet Tips",
//                "https://health-image.com/yoga.png"
//        );
//        categoryController.createCategory(req2);
//
//        // 3. READ: Ab Database se puchhte hain ki kya save hua?
//        System.out.println("\nStep 2: Fetching All Categories...");
//
//        List<CategoryResponse> categoryResponseList = categoryController.getCategories();
//
//        // 4. PRINT: Data ko screen pe dikhate hain
//        for(CategoryResponse cat : categoryResponseList){
//            System.out.println("----------------------------");
//            System.out.println("ID: " + cat.getId());
//            System.out.println("Title: " + cat.getTitle());
//            System.out.println("Description: " + cat.getDesc());
//            System.out.println("Image URL: " + cat.getcUrl());
//            System.out.println("----------------------------");
//
//        }

        CategoryController catController = new CategoryController();

        // 1. Category banayi
        CategoryRequest catReq = new CategoryRequest("Technology", "Tech Stuff", "url");
        catController.createCategory(catReq);
        // NOTE: Real code mein hum createCategory se ID return karwate hain.
        // Lekin abhi hum assume karte hain ki list ki pehli category "Technology" hai.
        String techId = catController.getCategories().get(0).getId();
        System.out.println("Tech Category ID mil gayi: " + techId);

        SubCategoryController subController = new SubCategoryController();
        System.out.println("\n--- Creating SubCategories ---");

        // Sahi ID ke saath (Ya Technology me jayega)
        SubCategoryRequest javaReq = new SubCategoryRequest(techId,"Java","Core Java");
        subController.createSubCategory(javaReq);

        // Sahi ID ke saath (Ye bhi Technology me jayega)
        SubCategoryRequest pythonReq = new SubCategoryRequest(techId, "Python", "AI ML");
        subController.createSubCategory(pythonReq);
        // galat ID ke sath (Test Validation)
        SubCategoryRequest errorReq = new SubCategoryRequest("9999","Alien Tech","Sci-Fi Stuff");
        subController.createSubCategory(errorReq);

        // 3. Ab Fetch karte hain(Filter Logic)
        System.out.println("\n--- Fetching SubCategories for Technology ---");
        List<SubCategoryResponse> techSub = subController.getSubCategoriesByCategoryId(techId);

        for(SubCategoryResponse sub : techSub){
            System.out.println("Found: "+sub.getName());
        }
    }
}

package in.bablu.blooms;

import in.bablu.blooms.controller.CategoryController;
import in.bablu.blooms.dto.CategoryRequest;
import in.bablu.blooms.dto.CategoryResponse;

import java.util.List;

public class UiClient {
    public static void main(String[] args){
        System.out.println("--- UI Client Started ---");
        // 1. Controller (Waiter) ko bulaya
        CategoryController categoryController = new CategoryController();

        // 2. CREATE: Ek nayi Request banayi aur Controller ko di
        System.out.println("Step 1: Creating Categories...");

        CategoryRequest req1 = new CategoryRequest(
                "Technology",
                "All about Java and Coding",
                "https://tech-image.com/java.png"
        );
        categoryController.createCategory(req1);

        CategoryRequest req2 = new CategoryRequest(
                "Health",
                "Fitness and Diet Tips",
                "https://health-image.com/yoga.png"
        );
        categoryController.createCategory(req2);

        // 3. READ: Ab Database se puchhte hain ki kya save hua?
        System.out.println("\nStep 2: Fetching All Categories...");

        List<CategoryResponse> categoryResponseList = categoryController.getCategories();

        // 4. PRINT: Data ko screen pe dikhate hain
        for(CategoryResponse cat : categoryResponseList){
            System.out.println("----------------------------");
            System.out.println("ID: " + cat.getId());
            System.out.println("Title: " + cat.getTitle());
            System.out.println("Description: " + cat.getDesc());
            System.out.println("Image URL: " + cat.getcUrl());
            System.out.println("----------------------------");

        }
    }
}

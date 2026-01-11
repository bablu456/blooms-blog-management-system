package in.bablu.blooms.models;
import java.util.List;

// Ye class ek "Bridge" (Pul) ka kaam karti hai.
// Ye Blog ko batati hai ki: "Main is Category ka hu, aur iske andar in Sub-Categories ka hu."
public class CategoryMapping {

    // 1. Parent Category (e.g., "Technology" ki ID)
    // Hum pura Category object nahi rakh rahe, sirf ID rakh rahe hain (Lightweight rakhne ke liye)
    private String categoryId;

    // 2. Us Category ke andar kaunse topics? (e.g., ["Java", "Spring Boot"])
    // Ek category me multiple sub-categories select ho sakti hain, isliye List<String> liya.
    private List<String> subCategoryIds;

    // --- Getters and Setters ---

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public List<String> getSubCategoryIds() {
        return subCategoryIds;
    }

    public void setSubCategoryIds(List<String> subCategoryIds) {
        this.subCategoryIds = subCategoryIds;
    }
}

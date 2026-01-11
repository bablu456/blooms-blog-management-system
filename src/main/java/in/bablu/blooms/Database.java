package in.bablu.blooms;

import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.SubCategory;
import in.bablu.blooms.models.User;

import javax.xml.crypto.Data;
import java.util.ArrayList;
import java.util.List;

public class Database {

    // 1. Singleton Instance (Khud ka reference)
    // Static isliye taaki bina object banaye access ho sake.
    private static Database instance = null;

    // 2. Private Constructor
    // Isse hum 'new Database()' ko block kar dete hain.
    // Koi bhi bahar se naya database nahi bana sakta.
    private Database(){
    }

    // 3. Global Access Point (Security Guard)
    // Ye method check karta hai: "Kya database pehle se bana hai?"
    // Agar nahi, to banata hai. Agar haan, to wahi purana wala deta hai.
    public static Database getInstance(){
        if(instance == null){
            instance = new Database();
        }
        return instance;
    }

    // ---  Data Storage (Lists) ---
    // 4. Categories ki List (Tech, Sports, etc.)
    private List<Category> categoryList = new ArrayList<>();

    // 5. SubCategories ki List (Java, Cricket, etc.)
    private List<SubCategory> subCategoryList = new ArrayList<>();

    // 6. Users ki List (Authors/Admins) -- (Maine add kiya)
    private List<User> userList = new ArrayList<>();

    // 7. Blogs ki List (Articles) -- (Maine add kiya)
    private List<Blog> blogList = new ArrayList<>();

    // --- GETTERS (Data access karne ke liye) ---

    public List<User> getUserList(){
        return userList;
    }

    public List<Blog> getBlogList(){
        return blogList;
    }
    public List<Category> getCategoryList(){
        return categoryList;
    }

    public List<SubCategory> getSubCategoryList(){
        return subCategoryList;
    }

}

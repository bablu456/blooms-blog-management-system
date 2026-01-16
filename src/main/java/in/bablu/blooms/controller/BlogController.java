package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.BlogRequest;
import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/blog")

public class BlogController {
    // --- 1. CREATE BLOG ---
    @PostMapping
    public String createBlog(BlogRequest request) {
    // Validation: Author (User) exist karta hai ya nahi?
        boolean authorExists = false;
        for(User user : Database.getInstance().getUserList()){
            if(user.getId().equals(request.getAuthorId())){
                authorExists = true;
                break;
            }
        }
        if(!authorExists){
            return "❌ Error: Author ID not found! Cannot create blog.";
        }

        Blog blog = new Blog();
        blog.setId(String.valueOf(System.currentTimeMillis()));
        blog.setTitle(request.getTitle());
        blog.setDescription(request.getDescription());
        blog.setContent(request.getContent());
        blog.setAuthorId(request.getAuthorId());

        blog.setCategoryMappings(request.getCategoryMappings());
        // Defaults
        blog.setStatus(Status.PUBLISHED.getDisplayName()); // Direct Publish kar rahe hain abhi
        blog.setCreatedDTTM(Timestamp.from(Instant.now()));

        // Save to Database
        Database.getInstance().getBlogList().add(blog);
        return "✅ Success: Blog Created - " + blog.getTitle();
    }

    // --- 2. GET ALL BLOGS (Feed) ---
    @GetMapping("/all")
    public List<BlogResponse> getAllBlogs(){
        List<Blog> blogs = Database.getInstance().getBlogList();
        List<BlogResponse> responseList = new ArrayList<>();

        for(Blog blog : blogs){
            BlogResponse blogResponse = new BlogResponse();
            blogResponse.setContent(blog.getContent());
            blogResponse.setId(blog.getId());
            blogResponse.setAuthorName(blog.getAuthorId());
            blogResponse.setTitle(blog.getTitle());
            blogResponse.setDescription(blog.getDescription());
            blogResponse.setCategoryMappings(blog.getCategoryMappings());
            blogResponse.setStatus(blog.getStatus());
            blogResponse.setCreatedTime(blog.getCreatedDTTM().toString());

            responseList.add(blogResponse);
        }
        return responseList;
    }

}

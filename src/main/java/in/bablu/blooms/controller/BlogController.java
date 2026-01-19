package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.BlogRequest;
import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/blog")

public class BlogController {













//    public String createBlog(@RequestBody BlogRequest request) {
////        boolean authorExists = false;
////        for(User user : Database.getInstance().getUserList()){
////            if(user.getId().equals(request.getAuthorId())){
////                authorExists = true;
////                break;
////            }
////        }
////        if(!authorExists){
////            return "❌ Error: Author ID not found! Cannot create blog.";
////        }
//
//        Blog blog = new Blog();
////        blog.setId(String.valueOf(System.currentTimeMillis()));
//        blog.setTitle(request.getTitle());
//        blog.setDescription(request.getDescription());
//        blog.setContent(request.getContent());
//        blog.setAuthorId(request.getAuthorId());
//
//        blog.setCategoryMappings(request.getCategoryMappings());
//
//        blog.setStatus(Status.PUBLISHED.getDisplayName()); // Direct Publish kar rahe hain abhi
//        blog.setCreatedAt(new Date());
//
//        Blog savedBlog = blogRepository.save(blog);
//        return "✅ Success: Blog Created - " + blog.getTitle();
//    }
//
//    @GetMapping("/all")
//    public List<BlogResponse> getAllBlogs(){
//        List<Blog> blogs = blogRepository.findAll();
//        List<BlogResponse> responseList = new ArrayList<>();
//
//
//        for(Blog blog : blogs){
//            BlogResponse blogResponse = new BlogResponse();
//            blogResponse.setId(blog.getId());
//            blogResponse.setAuthorName(blog.getAuthorId());
//            blogResponse.setDescription(blog.getDescription());
//            blogResponse.setTitle(blog.getTitle());
//            blogResponse.setContent(blog.getContent());
//
//            responseList.add(blogResponse);
//        }
//        return responseList;
//    }
//
//    @GetMapping("/{id}")
//    public BlogResponse getBlogById(@PathVariable String id){
//        Blog blog = blogRepository.findById(id).orElse(null);
//        if(blog !=null){
//            return mapToResponse(blog);
//        }
//        return null;
//    }
//
//    @DeleteMapping("/{id}")
//    public boolean deleteBlog(@PathVariable String id){
//        if(blogRepository.existsById(id)){
//            blogRepository.deleteById(id);
//            return true;
//        }
//        return false;
//    }
//
//    public BlogResponse mapToResponse(Blog blog){
//        return new BlogResponse(
//                blog.getId(),
//                blog.getTitle(),
//                blog.getDescription(),
//                blog.getContent(),
//                blog.getAuthorId(),
//                blog.getCategoryMappings()
//        );
//    }

}

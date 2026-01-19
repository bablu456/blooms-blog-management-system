package in.bablu.blooms.services;

import in.bablu.blooms.dto.BlogRequest;
import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.repositories.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BlogService {


    @Autowired
    private BlogRepository blogRepository;

    private Blog createBlog(Blog request){
        request.setCreatedAt(new Date());
        return blogRepository.save(request);
    }

    private Optional<Blog> getBlogById(String id){
        return blogRepository.findById(id);
    }

    private List<Blog> getAllBlogs(){
        return blogRepository.findAll();
    }

    private boolean deleteBlog(String id){
        if(blogRepository.existsById(id)){
            blogRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Blog> getBlogsByAuthor(String authorId){
        return blogRepository.findByAuthorId(authorId);
    }

}

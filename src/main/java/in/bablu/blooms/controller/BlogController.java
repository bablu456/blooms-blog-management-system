package in.bablu.blooms.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.bablu.blooms.dto.ApiMessageResponse;
import in.bablu.blooms.dto.BlogLikeResponse;
import in.bablu.blooms.dto.BlogRequest;
import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.dto.PagedResponse;
import in.bablu.blooms.mapper.BlogResponseMapper;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.User;
import in.bablu.blooms.services.BlogLikeService;
import in.bablu.blooms.services.BlogService;
import in.bablu.blooms.services.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/blog")
public class BlogController {
    @Autowired
    private UserService userService;

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogLikeService blogLikeService;

    @Autowired
    private BlogResponseMapper blogResponseMapper;

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(@Valid @RequestBody BlogRequest blogRequest) {
        Blog blog = new Blog();
        blog.setId(blogRequest.getId());
        blog.setTitle(blogRequest.getTitle()); // CRITICAL FIX: Was missing!
        blog.setContent(blogRequest.getContent());
        blog.setDescription(blogRequest.getDescription());
        blog.setImageUrl(blogRequest.getImageUrl());
        blog.setAuthorId(blogRequest.getAuthorId());
        blog.setCategoryMappings(blogRequest.getCategoryMappings());

        Blog savedBlog = blogService.createBlog(blog);
        return new ResponseEntity<>(blogResponseMapper.toResponse(savedBlog), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAllBlogs() {
        List<Blog> blogs = blogService.getAllBlogs();
        List<BlogResponse> responses = new ArrayList<>();
        for (Blog blog : blogs) {
            responses.add(blogResponseMapper.toResponse(blog));
        }
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/feed")
    public ResponseEntity<PagedResponse<BlogResponse>> getBlogFeed(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "9") int size) {
        Page<Blog> blogs = blogService.getBlogFeed(query, categoryId, page, size);
        List<BlogResponse> responses = new ArrayList<>();
        for (Blog blog : blogs.getContent()) {
            responses.add(blogResponseMapper.toResponse(blog));
        }

        PagedResponse<BlogResponse> pagedResponse = new PagedResponse<>(
                responses,
                blogs.getNumber(),
                blogs.getSize(),
                blogs.getTotalElements(),
                blogs.getTotalPages(),
                blogs.isLast()
        );
        return new ResponseEntity<>(pagedResponse, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<BlogResponse>> searchBlogs(@RequestParam("q") String query) {
        List<Blog> blogs = blogService.searchBlogs(query);
        List<BlogResponse> responses = new ArrayList<>();
        for (Blog blog : blogs) {
            responses.add(blogResponseMapper.toResponse(blog));
        }
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable String id) {
        return blogService.getBlogById(id)
                .map(blog -> new ResponseEntity<>(blogResponseMapper.toResponse(blog), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/{id}/like")
    public ResponseEntity<BlogLikeResponse> getLikeStatus(
            @PathVariable String id,
            @RequestParam(value = "userId", required = false) String userId) {
        BlogLikeResponse response = blogLikeService.getLikeStatus(id, userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<BlogLikeResponse> toggleLike(
            @PathVariable String id,
            @RequestParam("userId") String userId) {
        BlogLikeResponse response = blogLikeService.toggleLike(id, userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(
            @PathVariable String id,
            @Valid @RequestBody BlogRequest blogRequest,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            Blog existingBlog = blogService.getBlogById(id)
                    .orElse(null);
            if (existingBlog == null) {
                return new ResponseEntity<>(new ApiMessageResponse("Blog not found"), HttpStatus.NOT_FOUND);
            }

            User requester = userService.getCurrentUserEntityFromAccessToken(authorizationHeader);
            if (!canManageBlog(requester, existingBlog)) {
                return new ResponseEntity<>(new ApiMessageResponse("You can update only your own blogs"), HttpStatus.FORBIDDEN);
            }

            Blog blog = new Blog();
            blog.setTitle(blogRequest.getTitle());
            blog.setDescription(blogRequest.getDescription());
            blog.setContent(blogRequest.getContent());
            blog.setImageUrl(blogRequest.getImageUrl());
            blog.setStatus(existingBlog.getStatus());
            blog.setCategoryMappings(blogRequest.getCategoryMappings());

            Optional<Blog> updatedBlog = blogService.updateBlog(id, blog);
            if (updatedBlog.isPresent()) {
                return new ResponseEntity<>(blogResponseMapper.toResponse(updatedBlog.get()), HttpStatus.OK);
            }
            return new ResponseEntity<>(new ApiMessageResponse("Blog not found"), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<BlogResponse>> getBlogByAuthor(@PathVariable String authorId) {
        List<Blog> blogs = blogService.getBlogsByAuthor(authorId);
        List<BlogResponse> blogResponses = new ArrayList<>();
        for (Blog b : blogs) {
            blogResponses.add(blogResponseMapper.toResponse(b));
        }
        return new ResponseEntity<>(blogResponses, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            Blog existingBlog = blogService.getBlogById(id)
                    .orElse(null);
            if (existingBlog == null) {
                return new ResponseEntity<>(new ApiMessageResponse("Blog not found"), HttpStatus.NOT_FOUND);
            }

            User requester = userService.getCurrentUserEntityFromAccessToken(authorizationHeader);
            if (!canManageBlog(requester, existingBlog)) {
                return new ResponseEntity<>(new ApiMessageResponse("You can delete only your own blogs"), HttpStatus.FORBIDDEN);
            }

            if (blogService.deleteBlog(id)) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(new ApiMessageResponse("Blog not found"), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    private boolean canManageBlog(User requester, Blog blog) {
        return requester != null
                && blog != null
                && (requester.getId().equals(blog.getAuthorId()) || "ROLE_ADMIN".equals(requester.getRole()));
    }
}

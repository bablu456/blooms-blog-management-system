package in.bablu.blooms.services;

import in.bablu.blooms.models.Blog;
import in.bablu.blooms.repositories.BlogRepository;
import in.bablu.blooms.repositories.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Blog createBlog(Blog request) {
        request.setCreatedAt(new Date());
        request.setLikes(request.getLikes());
        request.setLikeCount(request.getLikes().size());
        return blogRepository.save(request);
    }

    public Optional<Blog> getBlogById(String id) {
        return blogRepository.findById(id);
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public boolean deleteBlog(String id) {
        if (blogRepository.existsById(id)) {
            blogRepository.deleteById(id);
            commentRepository.deleteByBlogId(id);
            return true;
        }
        return false;
    }

    public List<Blog> getBlogsByAuthor(String authorId) {
        return blogRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
    }

    public List<Blog> getLikedBlogsByUser(String userId) {
        return blogRepository.findByLikesContainingOrderByCreatedAtDesc(userId);
    }

    public Optional<Blog> updateBlog(String id, Blog request) {
        return blogRepository.findById(id).map(existingBlog -> {
            existingBlog.setTitle(request.getTitle());
            existingBlog.setDescription(request.getDescription());
            existingBlog.setContent(request.getContent());
            existingBlog.setImageUrl(request.getImageUrl());
            existingBlog.setStatus(request.getStatus());
            existingBlog.setCategoryMappings(request.getCategoryMappings());
            return blogRepository.save(existingBlog);
        });
    }

    public List<Blog> searchBlogs(String keyword) {
        return blogRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Page<Blog> getBlogFeed(String searchQuery, String categoryId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), 30);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Criteria criteria = buildFeedCriteria(searchQuery, categoryId);

        Query query = new Query().with(pageable);
        if (criteria != null) {
            query.addCriteria(criteria);
        }

        Query countQuery = new Query();
        if (criteria != null) {
            countQuery.addCriteria(criteria);
        }

        List<Blog> blogs = mongoTemplate.find(query, Blog.class);
        long total = mongoTemplate.count(countQuery, Blog.class);
        return new PageImpl<>(blogs, pageable, total);
    }

    private Criteria buildFeedCriteria(String searchQuery, String categoryId) {
        boolean hasSearch = searchQuery != null && !searchQuery.trim().isEmpty();
        boolean hasCategory = categoryId != null && !categoryId.trim().isEmpty();

        if (!hasSearch && !hasCategory) {
            return null;
        }

        java.util.ArrayList<Criteria> all = new java.util.ArrayList<>();

        if (hasSearch) {
            String escaped = Pattern.quote(searchQuery.trim());
            all.add(new Criteria().orOperator(
                    Criteria.where("title").regex(escaped, "i"),
                    Criteria.where("description").regex(escaped, "i"),
                    Criteria.where("content").regex(escaped, "i")
            ));
        }

        if (hasCategory) {
            all.add(Criteria.where("categoryMappings.categoryId").is(categoryId.trim()));
        }

        if (all.size() == 1) {
            return all.get(0);
        }

        return new Criteria().andOperator(all.toArray(new Criteria[0]));
    }

}

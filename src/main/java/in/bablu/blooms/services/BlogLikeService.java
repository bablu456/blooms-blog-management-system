package in.bablu.blooms.services;

import in.bablu.blooms.dto.BlogLikeResponse;
import in.bablu.blooms.exception.ResourceNotFoundException;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.BlogLike;
import in.bablu.blooms.repositories.BlogLikeRepository;
import in.bablu.blooms.repositories.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class BlogLikeService {

    @Autowired
    private BlogLikeRepository blogLikeRepository;

    @Autowired
    private BlogRepository blogRepository;

    public BlogLikeResponse toggleLike(String blogId, String userId) {
        String normalizedUserId = normalizeUserId(userId);
        Blog blog = getBlogWithLegacyLikes(blogId);
        Set<String> likes = new LinkedHashSet<>(blog.getLikes());

        boolean liked;
        if (likes.contains(normalizedUserId)) {
            likes.remove(normalizedUserId);
            liked = false;
        } else {
            likes.add(normalizedUserId);
            liked = true;
        }

        blog.setLikes(likes);
        Blog updatedBlog = blogRepository.save(blog);
        return new BlogLikeResponse(liked, updatedBlog.getLikeCount(), updatedBlog.getLikes());
    }

    public BlogLikeResponse getLikeStatus(String blogId, String userId) {
        Blog blog = getBlogWithLegacyLikes(blogId);
        String normalizedUserId = userId == null ? null : userId.trim();
        boolean liked = normalizedUserId != null && !normalizedUserId.isEmpty() && blog.getLikes().contains(normalizedUserId);
        return new BlogLikeResponse(liked, blog.getLikeCount(), blog.getLikes());
    }

    private Blog getBlogWithLegacyLikes(String blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!blog.getLikes().isEmpty()) {
            return blog;
        }

        Set<String> migratedLikes = new LinkedHashSet<>();
        for (BlogLike legacyLike : blogLikeRepository.findAllByBlogId(blogId)) {
            if (legacyLike.getUserId() != null && !legacyLike.getUserId().trim().isEmpty()) {
                migratedLikes.add(legacyLike.getUserId().trim());
            }
        }

        if (migratedLikes.isEmpty()) {
            return blog;
        }

        blog.setLikes(migratedLikes);
        return blogRepository.save(blog);
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("userId is required");
        }
        return userId.trim();
    }
}

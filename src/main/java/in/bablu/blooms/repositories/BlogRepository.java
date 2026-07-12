package in.bablu.blooms.repositories;

import in.bablu.blooms.models.Blog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends MongoRepository<Blog, String> {

    List<Blog> findTop5ByOrderByCreatedAtDesc();

    List<Blog> findTop5ByOrderByLikeCountDesc();

    List<Blog> findByAuthorIdOrderByCreatedAtDesc(String authorId);

    List<Blog> findByLikesContainingOrderByCreatedAtDesc(String userId);

    // Search by title (case insensitive)
    List<Blog> findByTitleContainingIgnoreCase(String title);
}

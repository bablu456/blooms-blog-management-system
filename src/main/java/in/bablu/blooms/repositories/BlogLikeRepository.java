package in.bablu.blooms.repositories;

import in.bablu.blooms.models.BlogLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogLikeRepository extends MongoRepository<BlogLike, String> {
    Optional<BlogLike> findByBlogIdAndUserId(String blogId, String userId);

    long countByBlogId(String blogId);

    List<BlogLike> findAllByBlogId(String blogId);
}

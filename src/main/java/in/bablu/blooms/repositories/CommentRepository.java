package in.bablu.blooms.repositories;

import in.bablu.blooms.models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByBlogIdOrderByCreatedAtAsc(String blogId);

    void deleteByBlogId(String blogId);
}

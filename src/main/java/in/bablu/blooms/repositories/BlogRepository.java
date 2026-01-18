package in.bablu.blooms.repositories;

import in.bablu.blooms.models.Blog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends MongoRepository<Blog, String>{

    List<Blog> findByAuthorId(String authorId);

}

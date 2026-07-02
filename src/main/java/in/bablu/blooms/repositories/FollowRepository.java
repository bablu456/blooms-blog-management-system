package in.bablu.blooms.repositories;

import in.bablu.blooms.models.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends MongoRepository<Follow, String> {
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);

    long countByFollowingId(String followingId);

    long countByFollowerId(String followerId);
}

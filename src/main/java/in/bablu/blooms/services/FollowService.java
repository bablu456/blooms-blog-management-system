package in.bablu.blooms.services;

import in.bablu.blooms.dto.FollowResponse;
import in.bablu.blooms.models.Follow;
import in.bablu.blooms.repositories.FollowRepository;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    public FollowResponse toggleFollow(String followerId, String followingId) {
        if (followerId == null || followerId.trim().isEmpty() || followingId == null || followingId.trim().isEmpty()) {
            throw new IllegalArgumentException("followerId and followingId are required");
        }
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        ensureUserExists(followerId);
        ensureUserExists(followingId);

        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        boolean following;

        if (existingFollow.isPresent()) {
            followRepository.delete(existingFollow.get());
            following = false;
        } else {
            Follow follow = new Follow();
            follow.setFollowerId(followerId);
            follow.setFollowingId(followingId);
            follow.setCreatedAt(LocalDateTime.now());
            followRepository.save(follow);
            following = true;
        }

        long followersCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followingId);
        return new FollowResponse(following, followersCount, followingCount);
    }

    public FollowResponse getFollowStats(String userId, String viewerId) {
        ensureUserExists(userId);

        boolean following = false;
        if (viewerId != null && !viewerId.trim().isEmpty() && !viewerId.equals(userId)) {
            following = followRepository.findByFollowerIdAndFollowingId(viewerId, userId).isPresent();
        }

        long followersCount = followRepository.countByFollowingId(userId);
        long followingCount = followRepository.countByFollowerId(userId);
        return new FollowResponse(following, followersCount, followingCount);
    }

    private void ensureUserExists(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
    }
}

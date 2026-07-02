package in.bablu.blooms.controller;

import in.bablu.blooms.dto.FollowResponse;
import in.bablu.blooms.services.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFollow(
            @RequestParam("followerId") String followerId,
            @RequestParam("followingId") String followingId) {
        try {
            FollowResponse response = followService.toggleFollow(followerId, followingId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getFollowStats(
            @PathVariable String userId,
            @RequestParam(value = "viewerId", required = false) String viewerId) {
        try {
            FollowResponse response = followService.getFollowStats(userId, viewerId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}

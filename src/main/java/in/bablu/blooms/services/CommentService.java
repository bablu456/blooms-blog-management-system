package in.bablu.blooms.services;

import in.bablu.blooms.dto.CommentRequest;
import in.bablu.blooms.dto.CommentResponse;
import in.bablu.blooms.dto.CommentUpdateRequest;
import in.bablu.blooms.exception.ResourceNotFoundException;
import in.bablu.blooms.models.Comment;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.BlogRepository;
import in.bablu.blooms.repositories.CommentRepository;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    public CommentResponse createComment(CommentRequest request) {
        String blogId = normalizeRequiredValue(request.getBlogId(), "Blog ID is required");
        String userId = normalizeRequiredValue(request.getUserId(), "User ID is required");
        String text = normalizeRequiredValue(request.getText(), "Comment text is required");

        if (!blogRepository.existsById(blogId)) {
            throw new ResourceNotFoundException("Blog not found");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setBlogId(blogId);
        comment.setUserId(userId);
        comment.setText(text);
        comment.setCreatedAt(Instant.now());

        Comment savedComment = commentRepository.save(comment);
        return mapToResponse(savedComment, user);
    }

    public List<CommentResponse> getAllComments() {
        List<Comment> comments = commentRepository.findAll(Sort.by(Sort.Direction.ASC, "createdAt"));
        return mapComments(comments);
    }

    public Optional<CommentResponse> getCommentById(String id) {
        return commentRepository.findById(id).map(comment -> {
            User user = userRepository.findById(comment.getUserId()).orElse(null);
            return mapToResponse(comment, user);
        });
    }

    public List<CommentResponse> getCommentsByBlogId(String blogId) {
        List<Comment> comments = commentRepository.findByBlogIdOrderByCreatedAtAsc(blogId);
        return mapComments(comments);
    }

    public Optional<CommentResponse> updateComment(String id, CommentUpdateRequest request) {
        String text = normalizeRequiredValue(request.getText(), "Comment text is required");
        return commentRepository.findById(id).map(existingComment -> {
            existingComment.setText(text);
            Comment savedComment = commentRepository.save(existingComment);
            User user = userRepository.findById(savedComment.getUserId()).orElse(null);
            return mapToResponse(savedComment, user);
        });
    }

    public boolean deleteComment(String id) {
        if (!commentRepository.existsById(id)) {
            return false;
        }
        commentRepository.deleteById(id);
        return true;
    }

    private List<CommentResponse> mapComments(List<Comment> comments) {
        List<String> userIds = comments.stream()
                .map(Comment::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return comments.stream()
                .map(comment -> mapToResponse(comment, usersById.get(comment.getUserId())))
                .toList();
    }

    private CommentResponse mapToResponse(Comment comment, User user) {
        String commenterName = "Unknown User";
        if (user != null) {
            if (user.getName() != null && !user.getName().trim().isEmpty()) {
                commenterName = user.getName().trim();
            } else if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
                commenterName = user.getUsername().trim();
            }
        }

        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getBlogId(),
                comment.getUserId(),
                commenterName,
                comment.getCreatedAt()
        );
    }

    private String normalizeRequiredValue(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}

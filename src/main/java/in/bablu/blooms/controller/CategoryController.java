package in.bablu.blooms.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.bablu.blooms.dto.CategoryRequest;
import in.bablu.blooms.dto.CategoryResponse;
import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.CategoryRepository;
import in.bablu.blooms.services.UserService;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private UserService userService;

    @Autowired
    public CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request, @RequestParam String userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isEmpty()) {
            return new ResponseEntity<>("Unauthorized: User not found", HttpStatus.FORBIDDEN);
        }

        Category category = new Category();
        category.setName(request.getTitle());
        category.setDescription(request.getDesc());
        category.setImageUrl(request.getcUrl());
        category.setStatus(Status.PUBLISHED.getDisplayName());
        category.setCreatedBy(user.get().getName());
        category.setActive(true);
        category.setCreatedDTTM(LocalDateTime.now());

        Category savedCategory = categoryRepository.save(category);
        return new ResponseEntity<>(
                new CategoryResponse(savedCategory.getId(), savedCategory.getName(), savedCategory.getDescription(),
                        savedCategory.getImageUrl()),
                HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable("id") String categoryId) {
        return categoryRepository.findById(categoryId)
                .map(c -> new ResponseEntity<>(
                        new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getImageUrl()),
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> responses = new ArrayList<>();
        for (Category c : categories) {
            responses.add(new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getImageUrl()));
        }
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id, @RequestParam String userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isEmpty() || !user.get().getRole().equals("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}

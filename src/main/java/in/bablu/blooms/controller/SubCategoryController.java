package in.bablu.blooms.controller;

import in.bablu.blooms.dto.SubCategoryRequest;
import in.bablu.blooms.dto.SubCategoryResponse;
import in.bablu.blooms.models.SubCategory;
import in.bablu.blooms.services.SubCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/subcategory")
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    @PostMapping
    public ResponseEntity<SubCategoryResponse> create(@Valid @RequestBody SubCategoryRequest request) {
        SubCategory subCategory = new SubCategory();
        subCategory.setName(request.getName());
        subCategory.setDescription(request.getDescription());
        subCategory.setCategoryId(request.getCategoryId());

        SubCategory saved = subCategoryService.createSubCategory(subCategory);

        return new ResponseEntity<>(
                new SubCategoryResponse(saved.getId(), saved.getCategoryId(), saved.getName(), saved.getDescription()),
                HttpStatus.CREATED);
    }

    // Get by Category
    @GetMapping("/{categoryId}")
    public ResponseEntity<List<SubCategoryResponse>> getCategory(@PathVariable String categoryId) {
        List<SubCategory> list = subCategoryService.getSubCategoriesByCategory(categoryId);
        List<SubCategoryResponse> responses = new ArrayList<>();
        for (SubCategory s : list) {
            SubCategoryResponse res = new SubCategoryResponse();
            res.setId(s.getId());
            res.setName(s.getName());
            res.setDescription(s.getDescription());
            res.setCategoryId(s.getCategoryId());
            responses.add(res);
        }
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    // Del
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (subCategoryService.deleteSubCategory(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<SubCategory>> getAll() {
        return new ResponseEntity<>(subCategoryService.getAll(), HttpStatus.OK);
    }
}

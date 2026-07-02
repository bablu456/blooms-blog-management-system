package in.bablu.blooms.controller;

import in.bablu.blooms.dto.ApiMessageResponse;
import in.bablu.blooms.dto.CloudinarySignRequest;
import in.bablu.blooms.dto.CloudinarySignResponse;
import in.bablu.blooms.services.CloudinaryService;
import in.bablu.blooms.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @PostMapping("/cloudinary/sign")
    public ResponseEntity<?> createCloudinaryUploadSignature(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody(required = false) CloudinarySignRequest request) {
        try {
            // Enforce authenticated uploads.
            userService.getCurrentUserFromAccessToken(authorizationHeader);
            CloudinarySignResponse response = cloudinaryService.createUploadSignature();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
}

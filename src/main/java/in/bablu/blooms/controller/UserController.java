package in.bablu.blooms.controller;

import in.bablu.blooms.dto.ApiMessageResponse;
import in.bablu.blooms.dto.AuthLoginPasswordRequest;
import in.bablu.blooms.dto.AuthTokenResponse;
import in.bablu.blooms.dto.ForgotPasswordResetRequest;
import in.bablu.blooms.dto.LogoutRequest;
import in.bablu.blooms.dto.OtpDispatchResponse;
import in.bablu.blooms.dto.OtpRequest;
import in.bablu.blooms.dto.OtpVerifyRequest;
import in.bablu.blooms.dto.RefreshTokenRequest;
import in.bablu.blooms.dto.UserRequest;
import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.mapper.BlogResponseMapper;
import in.bablu.blooms.models.User;
import in.bablu.blooms.services.BlogService;
import in.bablu.blooms.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogResponseMapper blogResponseMapper;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequest request) {
        try {
            User newUser = new User();
            newUser.setPhoneNumber(request.getPhoneNumber());
            newUser.setPassword(request.getPassword());
            newUser.setUsername(request.getUsername());
            newUser.setEmail(request.getEmail());
            newUser.setProfileUrl(request.getProfileUrl());
            newUser.setName(request.getName());
            newUser.setBio(request.getBio());
            newUser.setWebsite(request.getWebsite());
            newUser.setSocialLinks(request.getSocialLinks());

            String result = userService.registerUser(newUser);

            if (result.startsWith("Error")) {
                return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error registering user: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthLoginPasswordRequest request) {
        try {
            AuthTokenResponse response = userService.loginWithPassword(
                    request.getPhoneNumber(),
                    request.getPassword());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/login/password")
    public ResponseEntity<?> loginWithPassword(@Valid @RequestBody AuthLoginPasswordRequest request) {
        return login(request);
    }

    @PostMapping("/login/otp/request")
    public ResponseEntity<?> requestLoginOtp(@Valid @RequestBody OtpRequest request) {
        try {
            OtpDispatchResponse response = userService.requestLoginOtp(request.getPhoneNumber());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.TOO_MANY_REQUESTS);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login/otp/verify")
    public ResponseEntity<?> verifyLoginOtp(@Valid @RequestBody OtpVerifyRequest request) {
        try {
            AuthTokenResponse response = userService.loginWithOtp(request.getPhoneNumber(), request.getOtp());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthTokenResponse response = userService.refreshSession(request.getRefreshToken());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiMessageResponse> logout(@RequestBody(required = false) LogoutRequest request) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        userService.logout(refreshToken);
        return new ResponseEntity<>(new ApiMessageResponse("Logged out successfully"), HttpStatus.OK);
    }

    @PostMapping("/password/forgot/request")
    public ResponseEntity<?> requestForgotPasswordOtp(@Valid @RequestBody OtpRequest request) {
        try {
            OtpDispatchResponse response = userService.requestPasswordResetOtp(request.getPhoneNumber());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.TOO_MANY_REQUESTS);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/password/forgot/reset")
    public ResponseEntity<?> resetForgotPassword(@Valid @RequestBody ForgotPasswordResetRequest request) {
        try {
            userService.resetPasswordWithOtp(request.getPhoneNumber(), request.getOtp(), request.getNewPassword());
            return new ResponseEntity<>(new ApiMessageResponse("Password reset successful"), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            User currentUser = userService.getCurrentUserEntityFromAccessToken(authorizationHeader);
            if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
                return new ResponseEntity<>(new ApiMessageResponse("Admin access required"), HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<>(userService.getAll(), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            UserResponse response = userService.getCurrentUserFromAccessToken(authorizationHeader);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/me/liked-blogs")
    public ResponseEntity<?> getCurrentUserLikedBlogs(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            User currentUser = userService.getCurrentUserEntityFromAccessToken(authorizationHeader);
            List<BlogResponse> responses = blogResponseMapper.toResponses(
                    blogService.getLikedBlogsByUser(currentUser.getId()));
            return new ResponseEntity<>(responses, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(userService.toUserResponse(user), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody UserRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            User requester = userService.getCurrentUserEntityFromAccessToken(authorizationHeader);
            boolean isAdmin = "ROLE_ADMIN".equals(requester.getRole());
            boolean isSelf = requester.getId().equals(id);

            if (!isAdmin && !isSelf) {
                return new ResponseEntity<>(new ApiMessageResponse("You can update only your own profile"), HttpStatus.FORBIDDEN);
            }

            User updatedUser = userService.updateUser(
                    id,
                    request.getName(),
                    request.getProfileUrl(),
                    request.getBio(),
                    request.getWebsite(),
                    request.getSocialLinks());
            if (updatedUser != null) {
                return new ResponseEntity<>(userService.toUserResponse(updatedUser), HttpStatus.OK);
            }
            return new ResponseEntity<>(new ApiMessageResponse("User not found"), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }
}

package in.bablu.blooms.controller;

import in.bablu.blooms.dto.ApiMessageResponse;
import in.bablu.blooms.dto.AuthTokenResponse;
import in.bablu.blooms.dto.EmailOtpRequest;
import in.bablu.blooms.dto.EmailOtpVerifyRequest;
import in.bablu.blooms.dto.OtpDispatchResponse;
import in.bablu.blooms.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendEmailOtp(@Valid @RequestBody EmailOtpRequest request) {
        try {
            OtpDispatchResponse response = userService.requestEmailLoginOtp(request.getEmail());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalStateException e) {
            HttpStatus status = e.getMessage() != null && e.getMessage().startsWith("Please wait")
                    ? HttpStatus.TOO_MANY_REQUESTS
                    : HttpStatus.SERVICE_UNAVAILABLE;
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), status);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyEmailOtp(@Valid @RequestBody EmailOtpVerifyRequest request) {
        try {
            AuthTokenResponse response = userService.loginWithEmailOtp(request.getEmail(), request.getOtp());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
}

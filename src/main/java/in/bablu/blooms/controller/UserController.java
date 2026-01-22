package in.bablu.blooms.controller;

import in.bablu.blooms.dto.UserRequest;
import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.UserRepository;
import in.bablu.blooms.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired   // Springboot khud repository ka object bana ke yahan dega
    private UserService userService;

    @PostMapping("/register")
    public String registerUser(@RequestBody UserRequest request){

        User newUser = new User();
        newUser.setPassword(request.getPassword());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setProfileUrl(request.getProfileUrl());

        return userService.registerUser(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequest request) {

        // Ab ye line sahi match karegi
        UserResponse response = userService.loginUser(
                request.getPhoneNumber(),
                request.getPassword()
        );

        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>("❌ Invalid Phone Number or Password", HttpStatus.UNAUTHORIZED);
    }


    // Login
//    @PostMapping("/login")
//    public UserResponse loginUser(@RequestBody UserRequest loginRequest){
//        User user = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());
//
//        if(user!=null){
//            UserResponse userResponse = new UserResponse();
//            userResponse.setId(user.getId());
//            userResponse.setName(user.getName());
//            userResponse.setEmail(user.getEmail());
//            userResponse.setProfileUrl(user.getProfileUrl());
//            userResponse.setUsername(user.getUsername());
//            return userResponse;
//        }
//        return null;
//    }

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAll();
    }


//    @PostMapping("/register")
//    public String registerUser(UserRequest request){
//
//        if(userRepository.findByUsername(request.getUsername()).isPresent()) {
//            return " Error : Username alredy Exists!";
//        }
//        if(userRepository.findByEmail(request.getEmail()).isPresent()){
//            return " Error : Email alredy exists!";
//        }
//
//        User newUser = new User();
//        newUser.setId(String.valueOf(System.currentTimeMillis()));
//        newUser.setUsername(request.getUsername());
//        newUser.setEmail(request.getEmail());
//        newUser.setName(request.getName());
//        newUser.setProfileUrl(request.getProfileUrl());
//
//        newUser.setPassword(request.getPassword());
//
//        User savedUser = userRepository.save(newUser);
//
//        return "✅ Success: User registered with ID: " + newUser.getId();
//    }
//
//    @PostMapping("/login")
//    public UserResponse loginUser(@RequestBody UserRequest loginRequest){
//
//        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
//
//        if(user !=null && user.getPassword().equals(loginRequest.getPassword())){
//            return new UserResponse(user.getId(),user.getUsername(),user.getEmail(),user.getName(),user.getProfileUrl());
//        }
//
//        System.out.println("❌ Login Failed: Invalid Credentials");
//        return null;
//    }
//
//    // UserController.java ke andar
//
//    // --- 4. GET ALL USERS (Testing ke liye) ---
//    @GetMapping // URL: GET /users
//    public List<User> getAllUsers() {
//        return userRepository.findAll(); // Ye seedha MongoDB se data layega
//    }

//    // --- 3. GET USER (Profile View) ---
//    @GetMapping("/userid")
//    public UserResponse getUser(String userId){
//        for(User user : Database.getInstance().getUserList()){
//            if(user.getId().equals(userId)){
//                return new UserResponse(user.getId(),user.getUsername(),user.getEmail(),user.getName(),user.getProfileUrl());
//            }
//        }
//        return null;
//    }

//    @GetMapping
//    public List<UserResponse> viewAll(){
//        List<User> userList = Database.getInstance().getUserList();
//        List<UserResponse> users = new ArrayList<>();
//        for(User user : userList){
//            UserResponse userResponse = new UserResponse();
//            userResponse.setEmail(user.getEmail());
//            userResponse.setName(user.getName());
//            userResponse.setUsername(user.getUsername());
//            userResponse.setProfileUrl(user.getProfileUrl());
//            users.add(userResponse);
//        }
//        return users;
//    }

}

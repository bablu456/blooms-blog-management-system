package in.bablu.blooms.services;


import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            return " Error: UserName "+ user.getUsername() + " Alredy exists! ";
        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            return " Error: Email "+user.getEmail() + " is already Registered ";
        }

        User savedUser = userRepository.save(user);

        return " Success : User Register with ID: " + savedUser.getId();
    }

    public UserResponse loginUser (String phoneNumber, String password) {
        Optional<User> user = userRepository.findByPhoneNumberAndPassword(phoneNumber, password);

        if (user.isPresent()) {
            User user1 = user.get();

            // 2. Agar mil gaya, to Entity ko DTO mein badlo (Password hatao)
            UserResponse response = new UserResponse(
                    user1.getUsername(),
                    user1.getEmail(),
                    user1.getName(),
                    user1.getProfileUrl(),
                    user1.getPhoneNumber()
            );
            return response;
        }
        return null;
    }

    public List<User> getAll(){
        return userRepository.findAll();
    }
}

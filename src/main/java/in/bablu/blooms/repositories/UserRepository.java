package in.bablu.blooms.repositories;

import in.bablu.blooms.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User,String> {
    // Custom method : Username se dhundhane ke liye
    // Spring boot naam padh ke samajh jayega ki query kya banani hai!
    Optional<User> findUsername(String username);

    // Email Se dhundhane ke Liye
    Optional<User> findByEmail(String email);

}

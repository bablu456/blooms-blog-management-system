package in.bablu.blooms.repositories;

import in.bablu.blooms.models.OtpCode;
import in.bablu.blooms.models.OtpPurpose;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends MongoRepository<OtpCode, String> {
    Optional<OtpCode> findTopByPhoneNumberAndPurposeAndUsedFalseOrderByCreatedAtDesc(String phoneNumber, OtpPurpose purpose);
}

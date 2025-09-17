package com.E205.cocos_forest.api.user.signup.dto.in;

import com.E205.cocos_forest.domain.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

/**
 * @Getter / @Setter: 클라이언트의 JSON 데이터를 이 객체에 바인딩하기 위해 필요합니다.
 *
 * Validation Annotations: @NotBlank, @Email, @Pattern, @NotNull 등은
 * spring-boot-starter-validation 의존성을 통해 사용할 수 있습니다.
 *
 * 컨트롤러에서 @Valid 어노테이션과 함께 사용하면, 요청이 비즈니스 로직에 도달하기 전에 유효성 검사를 자동으로 수행해줍니다.
 *
 * toEntity(PasswordEncoder passwordEncoder)
 * : DTO 객체를 User 엔티티 객체로 변환하는 메서드입니다.
 * 이 때, 가장 중요한 부분은 passwordEncoder.encode()를 통해 비밀번호를 반드시 암호화하여 저장하는 것입니다.
 */
@Getter
@Setter
public class SignupRequestDto {

    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    private String nickname;

    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    @Pattern(regexp = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\\W)(?=\\S+$).{8,16}", message = "비밀번호는 8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.")
    private String password;

    private String phoneNumber;

    @NotNull(message = "이용약관 동의는 필수입니다.")
    private Boolean termsAgreed;

    @NotNull(message = "개인정보 처리방침 동의는 필수입니다.")
    private Boolean privacyPolicyAgreed;

    private Boolean marketingAgreed;

    public User toEntity(PasswordEncoder passwordEncoder) {
        LocalDateTime now = LocalDateTime.now();
        return User.builder()
                .email(this.email)
                .nickname(this.nickname)
                .password(passwordEncoder.encode(this.password)) // 비밀번호 암호화
                .phoneNumber(this.phoneNumber)
                .termsAgreedAt(this.termsAgreed ? now : null)
                .privacyPolicyAgreedAt(this.privacyPolicyAgreed ? now : null)
                .marketingAgreedAt(this.marketingAgreed != null && this.marketingAgreed ? now : null)
                .build();
    }
}
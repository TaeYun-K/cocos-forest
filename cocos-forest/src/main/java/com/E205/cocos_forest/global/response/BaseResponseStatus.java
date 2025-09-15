package com.E205.cocos_forest.global.response;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BaseResponseStatus {

  /**
   * 200: 요청 성공.
   **/
  SUCCESS(HttpStatus.OK, true, 200, "요청에 성공하였습니다."),

  /**
   * 400: 사용자 요청 에러.
   */
  ILLEGAL_ARGUMENT(HttpStatus.BAD_REQUEST, false, 400, "잘못된 요청입니다."),
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, false, 401, "적절하지 않은 요청값입니다."),

  WRONG_JWT_TOKEN(HttpStatus.UNAUTHORIZED, false, 401, "인증 정보가 유효하지 않습니다. 다시 로그인해주시기 바랍니다."),
  FAILED_TO_LOGIN(HttpStatus.UNAUTHORIZED, false, 401, "아이디 또는 비밀번호가 올바르지 않습니다."),
  NO_SIGN_IN(HttpStatus.UNAUTHORIZED, false, 401, "로그인이 필요한 요청입니다. 다시 로그인해주세요."),

  PASSWORD_NOT_MATCHED(HttpStatus.BAD_REQUEST, false, 400, "기존 비밀번호가 일치하지 않습니다."),
  PASSWORD_SAME_AS_CURRENT(HttpStatus.BAD_REQUEST, false, 400, "기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다."),
  DISABLED_USER(HttpStatus.FORBIDDEN, false, 403, "비활성화된 계정입니다. 관리자에게 문의해주시기 바랍니다."),
  NO_ACCESS_AUTHORITY(HttpStatus.FORBIDDEN, false, 403, "접근 권한이 없습니다. 관리자에게 문의해주시기 바랍니다."),
  NO_EXIST_USER(HttpStatus.NOT_FOUND, false, 404, "존재하지 않는 사용자입니다."),

  DATABASE_CONSTRAINT_VIOLATION(HttpStatus.CONFLICT, false, 409, "데이터베이스 제약 조건을 위반했습니다. "
      + "(유니크 키 중복, 외래 키 위반, NOT NULL 위반 등에서 발생합니다.)"),

  INVALID_JSON_FORMAT(HttpStatus.NOT_FOUND, false, 410, "유효하지 않은 JSON 형식입니다."),

  /**
   * 500: 기타 에러.
   */
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "서버에서 예기치 않은 오류가 발생했습니다."),

  /**
   * 600: 타입 에러.
   */
  INVALID_ROLE(HttpStatus.BAD_REQUEST, false, 601, "지원하지 않는 RoleType입니다."),

  /**
   * 700: House 에러.
   */
  INVALID_BUILDING_TYPE(HttpStatus.BAD_REQUEST, false, 701, "지원하지 않는 BuildingType입니다."),

  /**
   * 800: Notice 에러.
   */
  NO_EXIST_NOTICE(HttpStatus.NOT_FOUND, false, 804, "존재하지 않는 공지사항입니다."),


  // 로그인 실패
  INVALID_USER_JWT(HttpStatus.UNAUTHORIZED, false, 2001, "권한이 없는 유저의 접근입니다."),
  LOGIN_FAILED(HttpStatus.UNAUTHORIZED, false, 2002, "아이디 또는 비밀번호가 올바르지 않습니다."),
  INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, false, 2003, "비밀번호가 올바르지 않습니다."),
  USER_NOT_FOUND(HttpStatus.NOT_FOUND, false, 2004, "존재하지 않는 사용자입니다."),

  // 계정 상태 관련
  ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, false, 2005, "비활성화된 계정입니다."),
  ADVISOR_NOT_APPROVED(HttpStatus.FORBIDDEN, false, 2006, "승인되지 않은 전문가 계정입니다."),
  UNAUTHORIZED_ROLE(HttpStatus.FORBIDDEN, false, 2007, "해당 역할로 로그인할 권한이 없습니다."),

  // 토큰 관련
  INVALID_TOKEN(HttpStatus.UNAUTHORIZED, false, 2008, "유효하지 않은 토큰입니다."),
  EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, false, 2009, "만료된 토큰입니다."),
  TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, false, 2010, "토큰이 없습니다."),

  // 닉네임 중복 에러 코드 추가
  NICKNAME_DUPLICATION(HttpStatus.CONFLICT, false, 2011, "이미 사용중인 닉네임입니다."),
  // 파일 업로드 실패 에러 코드 추가
  FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 2012, "파일 업로드에 실패했습니다."),
  /**
   * 파일 저장소 관련 에러 코드 추가
   */
  FILE_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 2013, "파일 저장소 처리 중 오류가 발생했습니다."),
  /**
   * 이메일 인증 관련 에러 코드 추가
   */
  EMAIL_VERIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, false, 2014, "이메일 인증 정보가 존재하지 않습니다."),
  VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, false, 2015, "인증 코드의 유효 시간이 만료되었습니다."),
  VERIFICATION_CODE_MISMATCH(HttpStatus.BAD_REQUEST, false, 2016, "인증 코드가 일치하지 않습니다."),

  // ===== 토큰/인증 관련 에러 (2100번대) =====
  MISSING_TOKEN(HttpStatus.UNAUTHORIZED, false, 2101, "인증 토큰이 필요합니다."),
  INVALID_TOKEN_FORMAT(HttpStatus.UNAUTHORIZED, false, 2102, "토큰 형식이 올바르지 않습니다."),

  EXTERNAL_API_ERROR(HttpStatus.NOT_FOUND, false, 5201, "외부 금융 API 호출 중 오류가 발생했습니다."),
  LINKAGE_NOT_FOUND(HttpStatus.NOT_FOUND, false, 5203, "해당 유저의 SSAFY 연동 정보가 존재하지 않습니다.");


  private final HttpStatus httpStatus;
  private final boolean isSuccess;
  private final int code;
  private final String message;


}

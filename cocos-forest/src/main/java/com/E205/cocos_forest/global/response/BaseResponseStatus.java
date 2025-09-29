package com.E205.cocos_forest.global.response;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BaseResponseStatus {

  /**
   * 200: 요청 성공
   */
  SUCCESS(HttpStatus.OK, true, 200, "요청에 성공하였습니다."),

  /**
   * 400: 사용자 요청 에러
   */
  ILLEGAL_ARGUMENT(HttpStatus.BAD_REQUEST, false, 400, "잘못된 요청입니다."),
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, false, 401, "적절하지 않은 요청값입니다."),
  PASSWORD_NOT_MATCHED(HttpStatus.BAD_REQUEST, false, 400, "기존 비밀번호가 일치하지 않습니다."),
  PASSWORD_SAME_AS_CURRENT(HttpStatus.BAD_REQUEST, false, 400, "기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다."),
  NO_ACCESS_AUTHORITY(HttpStatus.FORBIDDEN, false, 403, "접근 권한이 없습니다. 관리자에게 문의해주시기 바랍니다."),
  DATABASE_CONSTRAINT_VIOLATION(HttpStatus.CONFLICT, false, 409, "데이터베이스 제약 조건을 위반했습니다. "
      + "(유니크 키 중복, 외래 키 위반, NOT NULL 위반 등에서 발생합니다.)"),
  INVALID_JSON_FORMAT(HttpStatus.NOT_FOUND, false, 410, "유효하지 않은 JSON 형식입니다."),
  /**
   * 500: 서버 에러
   */
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "서버에서 예기치 않은 오류가 발생했습니다."),

  /**
   * 도메인별 에러
   */
  // 600: 타입 관련
  INVALID_ROLE(HttpStatus.BAD_REQUEST, false, 601, "지원하지 않는 RoleType입니다."),
  // 800: 공지사항 관련
  NO_EXIST_NOTICE(HttpStatus.NOT_FOUND, false, 804, "존재하지 않는 공지사항입니다."),


  // ===================================================================================
  // ===== 인증, 유저 관련 에러 코드 (2000번대) =====
  // ===================================================================================

  // 2001~2020: 유저/계정 관련
  LOGIN_FAILED(HttpStatus.UNAUTHORIZED, false, 2002, "아이디 또는 비밀번호가 올바르지 않습니다."),
  INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, false, 2003, "비밀번호가 올바르지 않습니다."),
  USER_NOT_FOUND(HttpStatus.NOT_FOUND, false, 2004, "존재하지 않는 사용자입니다."),
  ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, false, 2005, "비활성화된 계정입니다."),
  ADVISOR_NOT_APPROVED(HttpStatus.FORBIDDEN, false, 2006, "승인되지 않은 전문가 계정입니다."), // (예시) 도메인 특화 에러
  UNAUTHORIZED_ROLE(HttpStatus.FORBIDDEN, false, 2007, "해당 역할로 로그인할 권한이 없습니다."),
  NICKNAME_DUPLICATION(HttpStatus.CONFLICT, false, 2011, "이미 사용중인 닉네임입니다."),


  // 2021~2040: 토큰 관련
  INVALID_USER_JWT(HttpStatus.UNAUTHORIZED, false, 2021, "권한이 없는 유저의 접근입니다."), // 로그인 실패가 아닌 토큰 유효성 문제이므로 이동
  INVALID_TOKEN(HttpStatus.UNAUTHORIZED, false, 2022, "유효하지 않은 토큰입니다."),
  EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, false, 2023, "만료된 토큰입니다."),
  TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, false, 2024, "토큰이 없습니다."),
  MISSING_TOKEN(HttpStatus.UNAUTHORIZED, false, 2025, "인증 토큰이 필요합니다."),
  INVALID_TOKEN_FORMAT(HttpStatus.UNAUTHORIZED, false, 2026, "토큰 형식이 올바르지 않습니다."),


  // 2041~2060: 이메일 인증 관련
  EMAIL_VERIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, false, 2041, "이메일 인증 정보가 존재하지 않습니다."),
  VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, false, 2042, "인증 코드의 유효 시간이 만료되었습니다."),
  VERIFICATION_CODE_MISMATCH(HttpStatus.BAD_REQUEST, false, 2043, "인증 코드가 일치하지 않습니다."),
  EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, false, 2044, "이메일 인증이 완료되지 않았습니다."), // 회원가입 로직에 필요하여 추가


  // 2061~2080: 파일 관련
  FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 2061, "파일 업로드에 실패했습니다."),
  FILE_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 2062, "파일 저장소 처리 중 오류가 발생했습니다."),

  // 4001~4020: 숲 관련
  FOREST_NOT_FOUND(HttpStatus.NOT_FOUND, false, 4001, "숲을 찾을 수 없습니다."),
  FOREST_ALREADY_EXISTS(HttpStatus.CONFLICT, false, 4002, "이미 숲이 존재합니다."),

  // 4021~4040: 나무 관련
  TREE_NOT_FOUND(HttpStatus.NOT_FOUND, false, 4021, "나무를 찾을 수 없습니다."),
  INVALID_TREE_POSITION(HttpStatus.BAD_REQUEST, false, 4022, "유효하지 않은 나무 위치입니다."),
  POSITION_OCCUPIED(HttpStatus.BAD_REQUEST, false, 4023, "이미 다른 나무가 있는 위치입니다."),
  POND_AREA_RESTRICTION(HttpStatus.BAD_REQUEST, false, 4024, "연못 영역에는 나무를 심을 수 없습니다."),
  OUT_OF_FOREST_BOUNDS(HttpStatus.BAD_REQUEST, false, 4025, "숲 범위를 벗어난 위치입니다."),
  DEAD_TREE_ACTION(HttpStatus.BAD_REQUEST, false, 4026, "죽은 나무에는 해당 행동을 할 수 없습니다."),
  TREE_NOT_DEAD(HttpStatus.BAD_REQUEST,false,4027, "살아있는 나무는 제거할 수 없습니다."),

  // 4041~4060: 물주기 관련
  WATER_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, false, 4041, "하루 물주기 제한을 초과했습니다. (하루 3회 제한)"),
  TREE_ALREADY_WATERED_MAX(HttpStatus.BAD_REQUEST, false, 4042, "오늘은 더 이상 물을 줄 수 없습니다."),

  // 4061~4080: 연못 관련
  INVALID_POND_POSITION(HttpStatus.BAD_REQUEST, false, 4061, "연못 위치가 유효하지 않습니다."),
  POND_TOO_CLOSE_TO_BOUNDARY(HttpStatus.BAD_REQUEST, false, 4062, "연못은 경계에서 최소 1칸 떨어져야 합니다."),

  // 4081~4100: 포인트 관련
  INSUFFICIENT_POINTS(HttpStatus.BAD_REQUEST, false, 4081, "포인트가 부족합니다."),
  POINTS_TRANSACTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 4082, "포인트 처리 중 오류가 발생했습니다."),
  POINTS_CONCURRENCY_ERROR(HttpStatus.CONFLICT, false, 4083, "포인트 처리 중 동시성 오류가 발생했습니다. 다시 시도해주세요."),
  INVALID_POINTS_AMOUNT(HttpStatus.BAD_REQUEST, false, 4084, "유효하지 않은 포인트 금액입니다."),
  POINTS_LEDGER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 4085, "포인트 내역 기록 중 오류가 발생했습니다."),

  // 4101~4120: 권한 관련
  UNAUTHORIZED_TREE_ACCESS(HttpStatus.FORBIDDEN, false, 4101, "다른 사용자의 나무입니다."),
  UNAUTHORIZED_FOREST_ACCESS(HttpStatus.FORBIDDEN, false, 4102, "다른 사용자의 숲입니다."),

  // ===================================================================================
  // ===== 외부 API 관련 에러 코드 (5000번대) =====
  // ===================================================================================
  EXTERNAL_API_ERROR(HttpStatus.NOT_FOUND, false, 5201, "외부 금융 API 호출 중 오류가 발생했습니다."),

  ACCOUNT_FETCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 5001, "계좌 정보 조회에 실패했습니다."),

  AI_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 5202, "AI 서비스로부터 유효하지 않은 응답을 받았습니다."),
  LINKAGE_NOT_FOUND(HttpStatus.NOT_FOUND, false, 5203, "해당 유저의 SSAFY 연동 정보가 존재하지 않습니다."),

  // ===================================================================================
  // ===== 거래 및 분석 관련 에러 코드 (6000번대) =====
  // ===================================================================================
  USER_CARD_NOT_LINKED(HttpStatus.BAD_REQUEST, false, 5204, "카드를 연결해주세요"),
  TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, false, 6001, "해당 날짜의 거래 내역을 찾을 수 없습니다.");

  private final HttpStatus httpStatus;
  private final boolean isSuccess;
  private final int code;
  private final String message;
}

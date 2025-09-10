✅ 오늘의 학습 기록 예시
3. 데이터베이스 - 외래 키와 ON DELETE CASCADE

외래 키 제약 조건을 걸어 부모 테이블 데이터가 삭제될 때 자식 데이터도 같이 삭제되도록 설정:

CONSTRAINT fk_summary_to_video_recording
  FOREIGN KEY (video_recording_id)
  REFERENCES video_recordings (id)
  ON DELETE CASCADE;


데이터 무결성을 유지하면서도 불필요한 데이터가 쌓이지 않게 관리할 수 있다.
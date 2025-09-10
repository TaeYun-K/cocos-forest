✅ 오늘의 학습 기록 예시
1. Git - 스테이징 해제하기

git add로 잘못 올린 파일을 스테이징에서 내리고 싶을 때:

git restore --staged <파일명>


모든 파일을 내리려면:

git restore --staged .


커밋은 남기고 변경사항만 내릴 수 있어서 유용하다.
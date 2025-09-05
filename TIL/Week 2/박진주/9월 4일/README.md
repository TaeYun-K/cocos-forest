오늘 목표
- 세계관·게이미피케이션 결정. 상태 연동 UI/애니메이션 설계.

수행
- 세계관 합의: 코코는 살리는 방향. 숲(Coco’s forest)을 보전·레벨업하는 흐름.
- 보상 구조: 포인트 → 씨앗/나무 구매 → 숲 확장, 동물 캐릭터 등장.
- 실패일 처리: 나무 소실, 레벨 다운. “죽임” 대신 “떠남/소실” 톤으로 연출.
- 레퍼런스 조사: Forest, Forest Island, 젤라뷰 참고.

프론트 구현 방안
- Compose + Lottie 기반.
- ViewModel이 탄소 지표 → CocoUiState 매핑.
- UI는 지정된 Lottie 재생.
- 자산 계획: 상태별 Lottie 파일(idle/sigh/sad_loop/cough/petrifying/disappear/revive 등) + 정지 이미지.

추가 고려사항:
- 탄소배출이 적으면 숲이 확장되고 코코의 친구 캐릭터가 점차 생겨남.
- 표현 방식은 2D/3D 미정이나, GPT 등 AI로 생성 가능성 확인 완료.
- 무료 아이콘 제공 사이트 존재 여부 확인.

산출물/링크
- 상태 전이 표(지표→상태→Lottie/배경/상호작용/카피)
- Compose/Lottie 시드 코드 초안

배운 점/메모
- ColorMatrix로 화면 채도 전역 제어. animate*AsState로 부드러운 전이.
- 상호작용 차단은 Modifier.pointerInput{} 혹은 clickable(enabled=false)로 처리.
- AI 기반 아트워크 활용 가능성 확인.

이슈/결정
- 탄소 임계값 산정식 고정 필요(연령대 평균 대비 % 혹은 z-score).
- Lottie 제작 파이프라인(에셋 명명 규칙, 프레임레이트, 반복 횟수) 표준화 필요.
- 2D/3D 방향성 확정 필요.

내일 할 일
- 1~2단계 Lottie 연결 MVP.
- 홈 레이어링(Z) 가이드 문서화(캐릭터/말풍선/네비 사이 간격 포함).
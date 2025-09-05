 - README
 
    # 🌴 코코의 숲 (Coco’s Forest)
    
    ## 탄소 절약 챌린지 × 금융 소비 분석 × 게임화
    
    > 코코의 숲은 금융 소비 내역을 기반으로 탄소 배출량을 환산하고, 챌린지와 게임적 요소를 통해 즐겁게 환경 보호를 실천할 수 있는 서비스입니다.
    > 
    > 
    > 소비 내역 → 탄소 발자국 → 챌린지 → 포인트 → 숲 성장으로 이어지는 선순환 구조를 통해, 사용자가 꾸준히 환경 보호 습관을 만들 수 있도록 돕습니다.
    > 
    - **개발 기간** : 2025.09 ~ (진행 중)
    - **플랫폼** : Mobile (kotlin), Android SDK 기반 네이티브 앱
    - **개발 인원** : 6명
    
    ---
    
    ## 👥 팀원
    
    | 이름 | 역할 |
    | --- | --- |
    | 김태윤 (팀장) | 백엔드, DB 설계, 금융 API 연동 |
    | 권인 | 프론트엔드, React Native, UI 구현 |
    | 김민주 | 프론트엔드, 챌린지/랭킹 화면 구현 |
    | 정원준 | 백엔드, 챌린지/보상 API |
    | 박민수 | 인프라, CI/CD, 배포 관리 |
    | 박진주 | 디자이너, 코코/숲 아트 에셋 제작 |
    
    ---
    
    ## 🧰 기술 스택
    
    <div align="center">  
      <!-- Core -->  
      <img src="https://img.shields.io/badge/kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white">  
      <img src="https://img.shields.io/badge/java-EA2D2E?style=for-the-badge&logo=java&logoColor=white">  
      <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">  
      <br/>  
      <!-- Frontend -->  
      <img src="https://img.shields.io/badge/android%20sdk-3DDC84?style=for-the-badge&logo=android&logoColor=white">  
      <img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white">  
      <img src="https://img.shields.io/badge/svg-FFB13B?style=for-the-badge&logoColor=white">  
      <br/>  
      <!-- DevOps / Cloud -->  
      <img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">  
      <img src="https://img.shields.io/badge/jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white">  
      <img src="https://img.shields.io/badge/aws-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white">  
      <br/>  
    </div>
    
    ---
    
    ## 🌐 메인화면 기능
    
    1. **아이소메트릭 필드**
        - 숲을 2D 아이소메트릭 뷰로 표현
    2. **나무 종류 1개 (초기 버전)**
        - 이후 다양한 나무와 숲 꾸미기 요소 확장
    3. **챌린지 성공 → 포인트 사용법**
        - 🌱 나무 심기
        - 💧 물주기
    4. **나무 상태 관리 (HP 시스템)**
        - **+ 요인** : 물주기, 하루 평균 탄소 절약 성공
        - **요인** : 물 미지급, 탄소 목표 초과
        - HP 단계별 3단계 시각화 (건강 → 약간 시듦 → 심하게 시듦)
    5. **코코 캐릭터**
        - 기본 위치: 왼쪽 상단 (랜덤 위치 확장 가능)
        - 이벤트 발생 시 말풍선으로 피드백
    
    ---
    
    ## ✨ 주요 기능
    
    ### 🔑 금융 연동 & 소비 분석
    
    - **SSAFY 금융 API** 연동
        - 계좌 거래 내역 조회
        - 카드 결제 내역/카테고리 조회
    - 소비 내역을 탄소 배출량으로 환산
    
    ### 🏆 챌린지 & 보상
    
    - 개인/그룹 챌린지 생성 및 참여
    - 달성 시 포인트 & 뱃지 획득
    - 포인트 → 숲 성장(심기/물주기)
    
    ### 📊 탄소 발자국 리포트
    
    - 일/주/월 단위 통계
    - 전주 대비 탄소 절감량 비교
    
    ### ⌚ 스마트워치 연동
    
    - 코코 캐릭터를 워치 페이스로 표시
    - 걸음 수 → 절약량 환산
    - 탄소 점수 위젯
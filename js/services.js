// ===== 서비스 목록 데이터 (팀 공용) =====
// 분야마다 파일이 따로 있어요. 팀원은 자기 분야 파일(js/data/…)만 수정하면 됩니다.
//   바이브 코딩   → js/data/vibe-coding.js
//   웹/UI/UX      → js/data/web-ui-ux.js
//   글쓰기/리서치 → js/data/writing-research.js
//   영상          → js/data/video.js
//   음성/음악     → js/data/voice-music.js
//   시각화/PPT    → js/data/visual-ppt.js
//
// 서비스 하나는 아래 모양의 { ... } 한 덩어리예요.
// {
//   icon: "🧠",                         // 서비스 아이콘 (이모지)
//   name: "서비스 이름",
//   category: "시각화/PPT",             // 위 6개 분야 중 하나 (글자 그대로)
//   desc: "한줄 소개",
//   url: "https://…",                   // 바로가기 주소
//   price: "무료+유료",                  // "무료" | "유료" | "무료+유료"
//   free: "무료 버전으로 할 수 있는 것", // 무료 버전이 없으면 ""
//   paid: "유료 버전에서 달라지는 점",   // 유료 버전이 없으면 ""
//   pros: ["장점1", "장점2"],
//   cons: ["단점1", "단점2"],
//   usage: "추천 용도",
//   review: "직접 써본 소감",            // 없으면 ""
//   tester: "써본 사람",
// }

const services = [];

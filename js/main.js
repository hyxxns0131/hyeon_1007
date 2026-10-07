// ===== 첫 화면 · 흐르는 띠 · 타입 카드 · 펭도리빵 대사 · 가이드 =====
// services(services.js)와 CATEGORIES, selectCategory 등(script.js)을 함께 사용합니다.

const $ = (id) => document.getElementById(id);

// ----- 타입별 AI 카드 (render() 때마다 개수 갱신) -----
function renderTypes() {
  const typeGrid = $("typeGrid");
  if (!typeGrid) return;
  typeGrid.innerHTML = CATEGORIES.filter((c) => c.name !== "전체").map((c) => {
    const n = services.filter((s) => s.category === c.name).length;
    return `
      <button class="type-card${n ? "" : " is-empty"}" type="button" data-category="${escapeHTML(c.name)}" style="--tc:${c.color}">
        <img class="type-poke" src="${pokeImg(c.pokemon[0][0])}" alt="${escapeHTML(c.pokemon[0][1])}" loading="lazy" />
        <span class="type-top">
          <span class="type-label">${c.emoji} ${escapeHTML(c.type)} 타입</span>
        </span>
        <span>
          <span class="type-name">${escapeHTML(c.name)}</span>
          <span class="type-count">${n ? `${n}개의 AI 발견! →` : "아직 발견된 AI 없음 · 준비 중"}</span>
        </span>
      </button>`;
  }).join("");
}

// 이름으로 목록의 카드를 찾아 이동 (필터 때문에 안 보이면 필터 해제)
function goToService(name) {
  let card = [...document.querySelectorAll(".card")].find((c) => c.dataset.name === name);
  if (!card) {
    currentCategory = "전체";
    keyword = "";
    searchInput.value = "";
    searchWrap.classList.remove("has-value");
    render();
    card = [...document.querySelectorAll(".card")].find((c) => c.dataset.name === name);
  }
  if (card) focusCard(card);
}

(() => {
  renderTypes();
  $("typeGrid").addEventListener("click", (e) => {
    const card = e.target.closest(".type-card");
    if (card) selectCategory(card.dataset.category);
  });

  $("heroCount").textContent = services.length;

  // ----- 흐르는 띠 (같은 내용을 두 번 이어 붙여 끊김 없이 반복) -----
  const freeCount = services.filter((s) => s.price.includes("무료")).length;
  const items = [
    "AI 모험을 떠나자",
    `${services.length}개의 AI 발견`,
    `${CATEGORIES.length - 1}가지 타입`,
    `${freeCount}개 무료로 시작`,
    "안내원 펭도리빵",
  ];
  const MARQUEE_POKEMON = [25, 1, 4, 7, 39];
  const once = items.map((t, i) =>
    `<span>${escapeHTML(t)}<img src="${pokeImg(MARQUEE_POKEMON[i % MARQUEE_POKEMON.length])}" alt="" /></span>`).join("");
  $("marquee").innerHTML = once + once;

  // ----- 펭도리빵 대사 (게임 대화창처럼 한 글자씩) -----
  const LINES = [
    "야생의 AI 서비스가 나타났다!",
    "펭도리빵은 어떤 AI가 좋은지 알고 있다.",
    "타입을 고르면 딱 맞는 AI를 찾아줄게!",
    "카드마다 요금, 장점, 단점이 다 적혀 있어!",
  ];
  const aboutLine = $("aboutLine");
  let li = 0;
  function typeLine(el, str, speed = 40) {
    clearInterval(el._typing);
    const chars = [...str];
    let i = 0;
    el.textContent = "";
    el._typing = setInterval(() => {
      el.textContent += chars[i++];
      if (i >= chars.length) { clearInterval(el._typing); el._typing = null; }
    }, speed);
  }
  typeLine(aboutLine, LINES[0]);
  setInterval(() => { li = (li + 1) % LINES.length; typeLine(aboutLine, LINES[li]); }, 4200);

  // ----- 여정 진행 바: 스크롤한 만큼 몬스터볼이 굴러감 -----
  const fill = $("journeyFill");
  const ball = $("journeyBall");
  function updateJourney() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    fill.style.width = `${p * 100}%`;
    ball.style.left = `calc(${p * 100}% - ${p * 22}px)`;
    ball.style.rotate = `${p * 1440}deg`;
  }
  addEventListener("scroll", updateJourney, { passive: true });
  addEventListener("resize", updateJourney);
  updateJourney();

  // ----- 첫 화면을 지나면 몬스터볼 버튼 보이기 -----
  const fab = $("ballFab");
  const hero = $("hero");
  const toggleFab = () => fab.classList.toggle("show", hero.getBoundingClientRect().bottom < innerHeight * .3);
  addEventListener("scroll", toggleFab, { passive: true });
  toggleFab();

  // ===== 펭도리빵 가이드 =====
  const GUIDE = [
    "AI 세계에 온 것을 환영해! 나는 안내원 펭도리빵이야.\n모험에 필요한 사용법을 알려줄게!",
    "🔍 위쪽 헤더의 검색창에 AI 이름이나 설명을 입력하면 바로 찾아줘.",
    "☰ 버튼으로 사이드바를 열면 타입을 고르거나 AI로 바로 이동할 수 있어.",
    "카드에서 요금, 무료와 유료 차이, 장점, 단점을 바로 볼 수 있어.\n[추천 용도 · 소감]을 누르면 더 자세한 이야기가 펼쳐져!",
  ];
  const guide = $("guide");
  const guideText = $("guideText");
  const guideDots = $("guideDots");
  const guideNext = $("guideNext");
  let gStep = 0;

  function showGuideStep(i) {
    gStep = i;
    typeLine(guideText, GUIDE[i], 26);
    guideDots.innerHTML = GUIDE.map((_, n) => `<span class="${n === i ? "on" : ""}"></span>`).join("");
    guideNext.textContent = i === GUIDE.length - 1 ? "알겠어!" : "다음 ▶";
  }
  function openGuide() {
    setSidebar(false);
    guide.classList.add("open");
    guide.setAttribute("aria-hidden", "false");
    showGuideStep(0);
  }
  function closeGuide() {
    clearInterval(guideText._typing);
    guide.classList.remove("open");
    guide.setAttribute("aria-hidden", "true");
  }

  guideNext.addEventListener("click", () => {
    if (guideText._typing) {
      // 타이핑 중이면 문장을 바로 끝까지 보여주기
      clearInterval(guideText._typing);
      guideText._typing = null;
      guideText.textContent = GUIDE[gStep];
    } else if (gStep < GUIDE.length - 1) showGuideStep(gStep + 1);
    else closeGuide();
  });
  $("guideClose").addEventListener("click", closeGuide);
  fab.addEventListener("click", () => (guide.classList.contains("open") ? closeGuide() : openGuide()));
  ["sideGuide", "navGuide", "aboutGuide", "ctaGuide"].forEach((id) => $(id).addEventListener("click", openGuide));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeGuide(); });

  // 마무리 배너의 [검색하기] → 맨 위 검색창으로
  $("ctaSearch").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    searchInput.focus({ preventScroll: true });
  });
})();

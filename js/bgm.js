// ===== 배경음악 (BGM) =====
// 1) audio/bgm.mp3 파일이 있으면 그 음악을 반복 재생합니다.
// 2) 파일이 없으면 직접 작곡한 8비트 모험 테마를 브라우저에서 만들어 재생합니다. (저작권 걱정 없음)
// 브라우저 정책상 소리는 사용자가 버튼을 눌러야 시작돼요.

(() => {
  const BGM_FILE = "audio/bgm.mp3";
  const VOLUME = 0.35;
  const btn = document.getElementById("bgmBtn");
  if (!btn) return;

  let playing = false;
  let mode = null;        // "file" | "synth"
  let audio = null;

  // ----- 8비트 모험 테마 (직접 작곡) -----
  // [MIDI 음 번호 또는 null(쉼표), 길이(8분음표 개수)]
  const MELODY = [
    [67, 1], [72, 1], [76, 2], [74, 1], [72, 1], [74, 2],
    [71, 2], [67, 2], [74, 3], [null, 1],
    [69, 1], [72, 1], [76, 2], [77, 1], [76, 1], [74, 2],
    [72, 4], [69, 2], [null, 2],
    [65, 1], [69, 1], [72, 2], [77, 2], [76, 2],
    [76, 1], [74, 1], [72, 2], [67, 2], [72, 2],
    [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [71, 2],
    [72, 6], [null, 2],
  ];
  const BASS_ROOTS = [48, 43, 45, 41, 41, 48, 50, 48]; // 마디마다 베이스 근음
  const BPM = 150;
  const EIGHTH = 60 / BPM / 2;
  const LOOP_LEN = 64;    // 8마디 × 8분음표 8개

  let ctx = null, master = null, timer = null;
  let step = 0, nextTime = 0;
  const melodyAt = [];    // 8분음표 위치별 [음, 길이]
  {
    let pos = 0;
    for (const [n, len] of MELODY) { melodyAt[pos] = [n, len]; pos += len; }
  }

  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function tone(type, midi, start, dur, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq(midi);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.01);
    g.gain.setValueAtTime(vol, start + dur * 0.75);
    g.gain.linearRampToValueAtTime(0, start + dur * 0.95);
    o.connect(g).connect(master);
    o.start(start);
    o.stop(start + dur);
  }

  function hat(start) {
    const len = 0.04;
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    g.gain.value = 0.05;
    src.buffer = buf;
    src.connect(g).connect(master);
    src.start(start);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.15) {
      const s = step % LOOP_LEN;
      const m = melodyAt[s];
      if (m && m[0] !== null) tone("square", m[0], nextTime, m[1] * EIGHTH, 0.09);
      const root = BASS_ROOTS[Math.floor(s / 8)];
      tone("triangle", s % 2 ? root + 12 : root, nextTime, EIGHTH, 0.22);
      if (s % 2 === 0) hat(nextTime);
      nextTime += EIGHTH;
      step++;
    }
  }

  function startSynth() {
    mode = "synth";
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(ctx.destination);
    }
    ctx.resume();
    step = 0;
    nextTime = ctx.currentTime + 0.05;
    clearInterval(timer);
    timer = setInterval(schedule, 25);
  }

  function stopSynth() {
    clearInterval(timer);
    if (ctx) ctx.suspend();
  }

  // ----- 재생 / 정지 -----
  function play() {
    playing = true;
    updateBtn();
    if (mode === "synth") return startSynth();
    if (!audio) {
      audio = new Audio(BGM_FILE);
      audio.loop = true;
      audio.volume = VOLUME;
      // 파일이 없거나 못 읽으면 직접 만든 음악으로
      audio.addEventListener("error", () => { if (playing) startSynth(); }, { once: true });
    }
    audio.play().then(() => { mode = "file"; }).catch((e) => {
      if (e.name !== "NotAllowedError" && playing) startSynth();
    });
  }

  function stop() {
    playing = false;
    updateBtn();
    if (audio) audio.pause();
    stopSynth();
  }

  function updateBtn() {
    btn.classList.toggle("on", playing);
    btn.setAttribute("aria-pressed", playing);
    btn.setAttribute("aria-label", playing ? "배경음악 끄기" : "배경음악 켜기");
    btn.querySelector(".text").textContent = playing ? "BGM ON" : "BGM OFF";
  }

  btn.addEventListener("click", () => (playing ? stop() : play()));
  updateBtn();
})();

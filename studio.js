const video = document.querySelector("#demo-media");
const toggle = document.querySelector("#demo-toggle");
const state = document.querySelector("#demo-state");
const status = document.querySelector("#demo-status");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection;

let phase = "idle";
let attempt = 0;
let loadTimer;
let autoObserver;

function setPhase(nextPhase) {
  phase = nextPhase;
  const active = phase !== "idle";
  toggle.setAttribute("aria-label", active ? "데모 일시정지" : "데모 재생");
  toggle.title = active ? "일시정지" : "재생";
  toggle.toggleAttribute("data-playing", active);
  state.textContent = phase === "loading" ? "불러오는 중" : "제품 데모";
}

function stop(message = "", resetSource = phase === "loading") {
  attempt += 1;
  clearTimeout(loadTimer);
  setPhase("idle");
  video.pause();
  if (resetSource && video.hasAttribute("src")) {
    video.removeAttribute("src");
    video.load();
  }
  status.textContent = message;
}

function stopObservingAutoplay() {
  autoObserver?.disconnect();
  autoObserver = undefined;
}

async function play(manual) {
  stopObservingAutoplay();
  const currentAttempt = ++attempt;
  status.textContent = "";
  setPhase("loading");

  if (!video.hasAttribute("src")) {
    video.src = video.dataset.src;
  }
  video.muted = true;

  loadTimer = setTimeout(() => {
    if (currentAttempt === attempt) {
      stop("영상 연결이 느립니다. 재생 버튼으로 다시 시도할 수 있어요.", true);
    }
  }, 12000);

  try {
    await video.play();
    if (currentAttempt === attempt) {
      clearTimeout(loadTimer);
      setPhase("playing");
    }
  } catch {
    if (currentAttempt === attempt) {
      stop(manual ? "영상을 재생하지 못했어요. 다시 시도할 수 있어요." : "", true);
    }
  }
}

toggle.hidden = false;
setPhase("idle");
toggle.addEventListener("click", () => {
  if (phase === "idle") {
    play(true);
  } else {
    stop();
  }
});

video.addEventListener("pause", () => {
  if (phase === "playing" && video.paused) {
    stop();
  }
});
video.addEventListener("playing", () => {
  if (phase === "idle") {
    video.pause();
  }
});
video.addEventListener("error", () => {
  if (phase !== "idle" && video.error) {
    stop("영상을 불러오지 못했어요. 재생 버튼으로 다시 시도할 수 있어요.", true);
  }
});

function shouldAutoplay() {
  return !motion.matches && !document.hidden && !connection?.saveData &&
    !["slow-2g", "2g"].includes(connection?.effectiveType);
}

function pauseForReducedMotion() {
  if (motion.matches) {
    stopObservingAutoplay();
    stop();
  }
}

if (motion.addEventListener) {
  motion.addEventListener("change", pauseForReducedMotion);
} else {
  motion.addListener(pauseForReducedMotion);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stop();
  }
});

if (shouldAutoplay()) {
  if ("IntersectionObserver" in window) {
    autoObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        stopObservingAutoplay();
        if (shouldAutoplay() && phase === "idle") {
          play(false);
        }
      }
    }, { threshold: .12 });
    autoObserver.observe(video);
  } else {
    play(false);
  }
}

if (!motion.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-reveal");
  const reveals = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        reveals.unobserve(entry.target);
      }
    }
  }, { threshold: .2 });

  document.querySelectorAll("[data-reveal]").forEach((section) => {
    reveals.observe(section);
  });
}

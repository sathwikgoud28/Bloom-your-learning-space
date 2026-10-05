import { courses, categories } from "./data.js";

const STORAGE_KEY = "bloom-learning-progress-v1";
const QUIZ_DURATION_SECONDS = 5 * 60;
const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");

const state = {
  screen: "dashboard",
  courseId: null,
  category: "All",
  query: "",
  progress: { completed: [], quizResults: {} },
  quiz: null,
  timerId: null,
  darkMode: false,
  courses: []
};

const icon = (name, size = 20) => {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-6 6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.463.402.807a6.5 6.5 0 0 0 8.268 8.268c.344-.215.829-.003.803.397z"/>',
    play: '<path d="m7 4 13 8-13 8z"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " toast-error" : ""}`;
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    return true;
  } catch (error) {
    console.error("Could not save learning progress:", error);
    showToast("Your browser couldn't save this update. Check your storage settings.", true);
    return false;
  }
}

function loadProgress() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { completed: [], quizResults: {} };
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.completed) || typeof parsed.quizResults !== "object" || parsed.quizResults === null) {
      throw new TypeError("Saved progress has an invalid shape.");
    }
    const courseIds = new Set(courses.map((course) => course.id));
    return {
      completed: parsed.completed.filter((id) => courseIds.has(id)),
      quizResults: Object.fromEntries(
        Object.entries(parsed.quizResults).filter(([id, result]) =>
          courseIds.has(id) && result && Number.isFinite(result.score) && Number.isFinite(result.attempts)
        )
      )
    };
  } catch (error) {
    console.error("Could not load learning progress:", error);
    showToast("We couldn't read your saved progress. Starting with a fresh view.", true);
    return { completed: [], quizResults: {} };
  }
}

function getCourse(courseId = state.courseId) {
  return state.courses.find((course) => course.id === courseId);
}

function completionPercent() {
  return state.courses.length ? Math.round(state.progress.completed.length / state.courses.length * 100) : 0;
}

function courseCard(course) {
  const complete = state.progress.completed.includes(course.id);
  const result = state.progress.quizResults[course.id];
  const progress = complete ? 100 : result ? Math.max(20, result.score) : 0;
  return `<button class="course-card" data-action="open-course" data-id="${course.id}">
    <div class="course-art art-${course.accent}"><span class="art-symbol">${course.icon}</span><span class="art-label">${escapeHTML(course.category)}</span><span class="art-scribble"></span></div>
    <div class="course-card-body">
      <div class="course-meta"><span>${escapeHTML(course.level)}</span><span class="meta-dot"></span><span>${course.duration}</span></div>
      <h3>${escapeHTML(course.title)}</h3>
      <p>${escapeHTML(course.description)}</p>
      <div class="course-card-footer">
        <span class="instructor"><span class="avatar avatar-${course.accent}">${course.initials}</span>${escapeHTML(course.instructor)}</span>
        <span class="lesson-count">${icon("book", 15)} ${course.lessons} lessons</span>
      </div>
      <div class="mini-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>
      ${complete ? '<span class="completed-label">' + icon("check", 13) + " Completed</span>" : ""}
    </div>
  </button>`;
}

function sidebar(active = "dashboard") {
  return `<aside class="sidebar">
    <button class="brand" data-action="dashboard" aria-label="Bloom home"><span class="brand-mark">b</span><span>bloom<span class="brand-dot">.</span></span></button>
    <div class="sidebar-section-label">YOUR SPACE</div>
    <nav class="sidebar-nav" aria-label="Main navigation">
      <button class="nav-item ${active === "dashboard" ? "active" : ""}" data-action="dashboard">${icon("home", 19)}<span>Discover</span></button>
      <button class="nav-item ${active === "courses" ? "active" : ""}" data-action="my-courses">${icon("book", 19)}<span>My learning</span><span class="nav-badge">${state.progress.completed.length}</span></button>
    </nav>
    <div class="sidebar-progress">
      <div class="sidebar-progress-top"><span>Your progress</span><span>${completionPercent()}%</span></div>
      <div class="sidebar-progress-bar"><span style="width:${completionPercent()}%"></span></div>
      <p>${state.progress.completed.length} of ${state.courses.length} courses completed</p>
    </div>
    <div class="sidebar-bottom">
      <div class="sidebar-note"><span class="note-spark">✳</span><p>Little by little<br />adds up to a lot.</p><span class="note-sign">— A gentle reminder</span></div>
      <button class="theme-toggle" data-action="theme">${icon(state.darkMode ? "sun" : "moon", 18)}<span>${state.darkMode ? "Light appearance" : "Dark appearance"}</span></button>
      <div class="profile-row"><span class="profile-avatar">Y</span><span class="profile-name"><strong>Your learning space</strong><small>Curious by nature</small></span><span class="profile-menu">···</span></div>
    </div>
  </aside>`;
}

function mobileNav(active = "dashboard") {
  return `<nav class="mobile-nav" aria-label="Mobile navigation">
    <button class="${active === "dashboard" ? "active" : ""}" data-action="dashboard">${icon("home", 19)}<span>Discover</span></button>
    <button class="${active === "courses" ? "active" : ""}" data-action="my-courses">${icon("book", 19)}<span>My learning</span></button>
    <button data-action="theme">${icon(state.darkMode ? "sun" : "moon", 19)}<span>Appearance</span></button>
  </nav>`;
}

function header(subtitle = "MONDAY, OCTOBER 5") {
  return `<header class="topbar"><div><div class="eyebrow">${subtitle}</div><div class="topbar-title">A little room to grow <span class="wave">✳</span></div></div>
    <div class="topbar-actions"><button class="icon-button theme-desktop" data-action="theme" aria-label="Toggle color theme">${icon(state.darkMode ? "sun" : "moon", 19)}</button><div class="topbar-avatar">Y</div></div>
  </header>`;
}

function renderDashboard(filterCompleted = false) {
  state.screen = filterCompleted ? "courses" : "dashboard";
  const coursesToShow = state.courses.filter((course) => {
    const matchesCategory = state.category === "All" || course.category === state.category;
    const matchesQuery = `${course.title} ${course.category} ${course.description}`.toLowerCase().includes(state.query.toLowerCase());
    const matchesCompleted = !filterCompleted || state.progress.completed.includes(course.id);
    return matchesCategory && matchesQuery && matchesCompleted;
  });
  const finished = state.progress.completed.length;
  const active = state.courses.length - finished;
  const completedCourses = state.courses.filter((course) => state.progress.completed.includes(course.id));

  app.innerHTML = `<div class="app-shell">${sidebar(filterCompleted ? "courses" : "dashboard")}
    <main class="main-content">
      ${header(filterCompleted ? "YOUR JOURNEY SO FAR" : "MONDAY, OCTOBER 5")}
      <section class="welcome-section"><div class="welcome-copy"><div class="greeting-pill"><span class="greeting-dot"></span>YOUR OWN PACE, YOUR OWN PATH</div>
        <h1>Good things grow<br />at <em>their own pace.</em></h1>
        <p>Follow what makes you curious. We’ve saved you a little space to learn something new today.</p>
        <a class="text-link" href="#explore" data-action="scroll-courses">Find your next little thing ${icon("arrow", 16)}</a>
      </div><div class="welcome-art" aria-hidden="true"><div class="sun-disc"></div><div class="plant plant-one"><i></i><i></i><i></i><b></b></div><div class="plant plant-two"><i></i><i></i><b></b></div><div class="floating-star">✳</div><div class="welcome-caption"><span>A moment just for you</span><strong>Make yourself at home.</strong></div></div>
      </section>
      <section class="stats-row" aria-label="Learning statistics">
        <div class="stat-card stat-progress"><div class="stat-icon">${icon("chart", 20)}</div><div><span class="stat-label">YOUR OVERALL PROGRESS</span><strong>${completionPercent()}<small>%</small></strong><span class="stat-caption">${finished === 0 ? "Your first step is waiting" : `${finished} of ${state.courses.length} courses complete`}</span></div><div class="progress-ring" style="--progress:${completionPercent() * 3.6}deg"><span>${finished}<small>/${state.courses.length}</small></span></div></div>
        <div class="stat-card stat-active"><div class="stat-icon">${icon("book", 20)}</div><div><span class="stat-label">STILL TO EXPLORE</span><strong>${active}<small> courses</small></strong><span class="stat-caption">No rush. They’ll be right here.</span></div><span class="stat-decoration">✳</span></div>
        <div class="stat-card stat-finished"><div class="stat-icon">${icon("check", 20)}</div><div><span class="stat-label">LITTLE WINS</span><strong>${finished}<small> completed</small></strong><span class="stat-caption">${finished ? "Every one is worth celebrating." : "Your first is going to feel good."}</span></div><span class="stat-decoration">✿</span></div>
      </section>
      ${completedCourses.length ? `<section class="continue-strip"><div class="continue-icon">✦</div><div><span class="eyebrow">A LITTLE WIN</span><strong>You finished ${escapeHTML(completedCourses.at(-1).title)}!</strong></div><button data-action="open-course" data-id="${completedCourses.at(-1).id}">Take another look ${icon("arrow", 15)}</button></section>` : ""}
      <section class="courses-section" id="explore"><div class="section-heading"><div><div class="eyebrow">${filterCompleted ? "LOOK HOW FAR YOU’VE COME" : "A FEW GOOD PLACES TO BEGIN"}</div><h2>${filterCompleted ? "Your learning" : "Follow your curiosity"}<span class="heading-spark">✳</span></h2><p>${filterCompleted ? "All the things you’ve made time to explore." : "Small, thoughtful courses made for real life."}</p></div>
        <label class="search-box">${icon("search", 18)}<input type="search" data-search placeholder="Find something lovely..." value="${escapeHTML(state.query)}" aria-label="Search courses"><kbd>⌘ K</kbd></label>
      </div>
      <div class="course-filters" role="group" aria-label="Filter courses">${categories.map((category) => `<button class="filter-chip ${state.category === category ? "selected" : ""}" data-action="filter" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("")}<span class="course-count">${coursesToShow.length} ${coursesToShow.length === 1 ? "course" : "courses"}</span></div>
      ${coursesToShow.length ? `<div class="course-grid">${coursesToShow.map(courseCard).join("")}</div>` : `<div class="empty-state"><span class="empty-flower">✿</span><h3>${state.courses.length ? "Nothing here just yet." : "Your learning space is taking a breather."}</h3><p>${state.courses.length ? "Try another search or choose a different topic." : "We couldn’t find any courses right now. Give it another try."}</p><button class="primary-button" data-action="retry-load">${icon("arrow", 17)} ${state.courses.length ? "Clear filters" : "Try again"}</button></div>`}
      </section>
      <footer class="page-footer"><span>Made for curious minds <span class="footer-heart">♥</span></span><span>Take your time. You’re doing just fine.</span></footer>
    </main>${mobileNav(filterCompleted ? "courses" : "dashboard")}</div>`;
  applyTheme();
}

function renderDetail() {
  const course = getCourse();
  if (!course) return renderDashboard();
  state.screen = "detail";
  const complete = state.progress.completed.includes(course.id);
  const result = state.progress.quizResults[course.id];
  app.innerHTML = `<div class="app-shell">${sidebar("courses")}<main class="main-content detail-main">
    <button class="back-link" data-action="dashboard">${icon("back", 18)} Back to your learning space</button>
    <section class="detail-hero art-${course.accent}"><div class="detail-hero-copy"><div class="detail-category">${escapeHTML(course.category)} <span>·</span> ${escapeHTML(course.level)}</div><h1>${escapeHTML(course.title)}</h1><p>${escapeHTML(course.description)}</p><div class="detail-byline"><span class="avatar avatar-${course.accent}">${course.initials}</span><span>Created with care by <strong>${escapeHTML(course.instructor)}</strong></span><span class="byline-divider"></span>${icon("clock", 16)}<span>${course.duration} of learning</span></div></div><span class="detail-art-symbol">${course.icon}</span><span class="detail-spark detail-spark-one">✳</span><span class="detail-spark detail-spark-two">✦</span></section>
    <div class="detail-layout"><div class="detail-content"><section class="detail-section"><div class="eyebrow">A LITTLE ABOUT THIS COURSE</div><h2>A space to explore, not to rush.</h2><p class="course-summary">${escapeHTML(course.summary)}</p></section>
      <section class="detail-section lesson-section"><div class="lesson-heading"><div><div class="eyebrow">THE JOURNEY</div><h2>${course.lessons} gentle steps</h2></div><span class="total-duration">${icon("clock", 15)} ${course.duration}</span></div>
        <div class="lesson-list">${course.modules.map(([number, title, duration, description]) => `<div class="lesson-row"><span class="lesson-number">${number}</span><div class="lesson-info"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(description)}</span></div><span class="lesson-duration">${duration}</span><button class="lesson-play" data-action="lesson" data-number="${number}" aria-label="Open lesson ${number}">${icon("play", 14)}</button></div>`).join("")}</div>
      </section>
    </div><aside class="detail-aside"><div class="course-action-card"><div class="action-card-art art-${course.accent}"><span>${course.icon}</span><i>✳</i></div><span class="eyebrow">YOUR NEXT LITTLE STEP</span><h3>${complete ? "You’ve grown through this one." : "Ready when you are."}</h3><p>${complete ? "This course is marked complete. You can revisit any lesson or take the quiz again." : "Take a lesson, try the quiz, or simply see where this takes you."}</p>
        <button class="primary-button full-button" data-action="start-quiz">${icon("play", 16)} ${result ? "Try the quiz again" : "Start the course quiz"}</button>
        <button class="secondary-button full-button" data-action="toggle-complete">${complete ? icon("check", 17) + " Mark as not completed" : icon("check", 17) + " Mark as completed"}</button>
        ${result ? `<div class="last-result"><span class="result-star">✳</span><span><strong>Your last quiz: ${result.score}%</strong><small>${result.correct}/${course.quiz.length} correct · ${result.attempts} ${result.attempts === 1 ? "try" : "tries"}</small></span><button data-action="results">View</button></div>` : ""}
      </div><div class="aside-note"><span>✿</span><p>There’s no such thing as behind. This is <em>your</em> journey.</p></div></aside></div>
    <footer class="page-footer"><span>Made for curious minds <span class="footer-heart">♥</span></span><span>Take your time. You’re doing just fine.</span></footer>
    </main>${mobileNav("courses")}</div>`;
  applyTheme();
}

function renderQuiz() {
  const course = getCourse();
  if (!course || !state.quiz) return renderDashboard();
  state.screen = "quiz";
  const { index, answers, secondsLeft } = state.quiz;
  const question = course.quiz[index];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const min = Math.floor(secondsLeft / 60);
  const sec = String(secondsLeft % 60).padStart(2, "0");
  app.innerHTML = `<div class="quiz-shell"><header class="quiz-topbar"><button class="brand" data-action="exit-quiz"><span class="brand-mark">b</span><span>bloom<span class="brand-dot">.</span></span></button><div class="quiz-course-label"><span>YOUR LITTLE QUIZ</span><strong>${escapeHTML(course.title)}</strong></div><button class="quiz-exit" data-action="exit-quiz">${icon("close", 18)}<span>Save & exit</span></button></header>
    <main class="quiz-main"><div class="quiz-progress-head"><span>QUESTION ${String(index + 1).padStart(2, "0")} <i>OF</i> ${String(course.quiz.length).padStart(2, "0")}</span><div class="quiz-progress-track">${course.quiz.map((_, i) => `<span class="${i < index ? "past" : ""} ${i === index ? "current" : ""} ${answers[i] !== null ? "answered" : ""}"></span>`).join("")}</div><span class="quiz-answered">${answeredCount} answered</span></div>
    <div class="quiz-question-card"><div class="quiz-flower">✳</div><div class="eyebrow">TAKE A BREATH. YOU’VE GOT THIS.</div><h1>${escapeHTML(question.question)}</h1><p>Choose the answer that feels right to you.</p>
      <div class="answer-options">${question.options.map((option, i) => `<button class="answer-option ${answers[index] === i ? "chosen" : ""}" data-action="answer" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(option)}</span><span class="answer-radio">${answers[index] === i ? icon("check", 13) : ""}</span></button>`).join("")}</div>
      <div class="quiz-controls"><button class="secondary-button quiz-prev" data-action="previous" ${index === 0 ? "disabled" : ""}>${icon("back", 16)} Previous</button><div class="timer ${secondsLeft < 60 ? "timer-urgent" : ""}" aria-label="Time remaining">${icon("clock", 17)}<span>${min}:${sec}</span></div><button class="primary-button quiz-next" data-action="${index === course.quiz.length - 1 ? "finish-quiz" : "next"}">${index === course.quiz.length - 1 ? "See my results" : "Next question"} ${icon("arrow", 16)}</button></div>
    </div><div class="quiz-footer-note"><span>✿</span> Your best effort is always enough.</div></main></div>`;
  applyTheme();
}

function calculateResults(course) {
  const correct = state.quiz.answers.reduce((count, answer, index) => count + (answer === course.quiz[index].answer ? 1 : 0), 0);
  const incorrect = course.quiz.length - correct;
  return { correct, incorrect, score: Math.round(correct / course.quiz.length * 100) };
}

function renderResults() {
  const course = getCourse();
  if (!course || !state.quiz) return renderDashboard();
  state.screen = "results";
  const result = calculateResults(course);
  const encouraging = result.score === 100 ? "Look at you, growing!" : result.score >= 60 ? "That knowledge is taking root." : "Every try is a place to begin.";
  app.innerHTML = `<div class="quiz-shell"><header class="quiz-topbar"><button class="brand" data-action="dashboard"><span class="brand-mark">b</span><span>bloom<span class="brand-dot">.</span></span></button><div class="quiz-course-label"><span>YOUR LITTLE QUIZ</span><strong>${escapeHTML(course.title)}</strong></div><span class="result-header-note">One step at a time <span>✿</span></span></header>
    <main class="results-main"><div class="results-card"><div class="results-flower">${result.score === 100 ? "✿" : result.score >= 60 ? "✳" : "❋"}</div><div class="eyebrow">A MOMENT TO CELEBRATE</div><h1>${encouraging}</h1><p class="results-subtitle">You showed up and gave it a go. That’s something to feel good about.</p><div class="score-circle" style="--score:${result.score * 3.6}deg"><div><strong>${result.score}<small>%</small></strong><span>YOUR SCORE</span></div></div>
      <div class="results-breakdown"><div><span class="breakdown-icon correct-icon">${icon("check", 17)}</span><strong>${result.correct}</strong><span>correct</span></div><span class="breakdown-divider"></span><div><span class="breakdown-icon incorrect-icon">↻</span><strong>${result.incorrect}</strong><span>incorrect</span></div><span class="breakdown-divider"></span><div><span class="breakdown-icon">${icon("clock", 16)}</span><strong>${course.quiz.length}</strong><span>questions</span></div></div>
      <div class="results-message"><span>✦</span><p>${result.score === 100 ? "A lovely bit of learning to carry into your day." : "A little review is part of the process. Take your time, and come back whenever you like."}</p></div>
      <div class="results-actions"><button class="primary-button" data-action="retry-quiz">${icon("arrow", 16)} Give it another go</button><button class="secondary-button" data-action="course-detail">${icon("book", 16)} Back to the course</button></div><button class="results-home-link" data-action="dashboard">Back to your learning space</button>
    </div><p class="results-footer">“The beautiful thing about learning is nobody can take it away from you.” <span>— B.B. King</span></p></main></div>`;
  applyTheme();
}

function startQuiz() {
  const course = getCourse();
  if (!course) return;
  clearInterval(state.timerId);
  state.quiz = { index: 0, answers: Array(course.quiz.length).fill(null), secondsLeft: QUIZ_DURATION_SECONDS };
  state.screen = "quiz";
  renderQuiz();
  state.timerId = window.setInterval(() => {
    if (!state.quiz) return;
    state.quiz.secondsLeft -= 1;
    if (state.quiz.secondsLeft <= 0) {
      state.quiz.secondsLeft = 0;
      finishQuiz();
      showToast("Time’s up! Here’s how you did.");
    } else {
      const timer = app.querySelector(".timer span");
      if (timer) timer.textContent = `${Math.floor(state.quiz.secondsLeft / 60)}:${String(state.quiz.secondsLeft % 60).padStart(2, "0")}`;
      app.querySelector(".timer")?.classList.toggle("timer-urgent", state.quiz.secondsLeft < 60);
    }
  }, 1000);
}

function finishQuiz() {
  clearInterval(state.timerId);
  state.timerId = null;
  const course = getCourse();
  if (!course || !state.quiz) return;
  const result = calculateResults(course);
  const previous = state.progress.quizResults[course.id];
  state.progress.quizResults[course.id] = { ...result, attempts: (previous?.attempts || 0) + 1, completedAt: new Date().toISOString() };
  saveProgress();
  state.screen = "results";
  renderResults();
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", state.darkMode);
}

function loadCourses() {
  app.innerHTML = `<div class="loading-screen"><span class="brand-mark">b</span><p>Making a little room to grow…</p><span class="loading-leaves">✳</span></div>`;
  return new Promise((resolve) => window.setTimeout(() => resolve(courses), 260));
}

async function initialize() {
  try {
    state.progress = loadProgress();
    state.courses = await loadCourses();
    renderDashboard();
  } catch (error) {
    console.error("Could not load courses:", error);
    app.innerHTML = `<main class="fatal-state"><span class="empty-flower">✿</span><h1>We couldn’t open your learning space.</h1><p>Please check your connection or try again in a moment.</p><button class="primary-button" data-action="retry-load">Try again</button></main>`;
  }
}

function navigateToDashboard(completedOnly = false) {
  clearInterval(state.timerId);
  state.timerId = null;
  state.quiz = null;
  state.courseId = null;
  renderDashboard(completedOnly);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action } = target.dataset;
  if (action === "dashboard") navigateToDashboard();
  else if (action === "my-courses") navigateToDashboard(true);
  else if (action === "open-course") {
    state.courseId = target.dataset.id;
    renderDetail();
  } else if (action === "filter") {
    state.category = target.dataset.category;
    renderDashboard(state.screen === "courses");
  } else if (action === "scroll-courses") {
    event.preventDefault();
    document.querySelector("#explore")?.scrollIntoView({ behavior: "smooth" });
  } else if (action === "theme") {
    state.darkMode = !state.darkMode;
    if (state.screen === "detail") renderDetail();
    else if (state.screen === "quiz") renderQuiz();
    else if (state.screen === "results") renderResults();
    else renderDashboard(state.screen === "courses");
  } else if (action === "toggle-complete") {
    const course = getCourse();
    if (!course) return;
    const index = state.progress.completed.indexOf(course.id);
    if (index >= 0) state.progress.completed.splice(index, 1);
    else state.progress.completed.push(course.id);
    saveProgress();
    renderDetail();
    if (index < 0) showToast("A little win, saved for you. ✿");
  } else if (action === "start-quiz" || action === "retry-quiz") startQuiz();
  else if (action === "answer") {
    if (state.quiz) {
      state.quiz.answers[state.quiz.index] = Number(target.dataset.answer);
      renderQuiz();
    }
  } else if (action === "next") {
    const course = getCourse();
    if (state.quiz && state.quiz.index < course.quiz.length - 1) {
      state.quiz.index += 1;
      renderQuiz();
    }
  } else if (action === "previous") {
    if (state.quiz && state.quiz.index > 0) {
      state.quiz.index -= 1;
      renderQuiz();
    }
  } else if (action === "finish-quiz") finishQuiz();
  else if (action === "exit-quiz") {
    clearInterval(state.timerId);
    state.timerId = null;
    state.quiz = null;
    renderDetail();
  } else if (action === "course-detail") renderDetail();
  else if (action === "results") {
    if (state.progress.quizResults[state.courseId]) {
      const course = getCourse();
      state.quiz = { index: 0, answers: Array(course.quiz.length).fill(null), secondsLeft: 0 };
      const saved = state.progress.quizResults[state.courseId];
      state.quiz.savedResult = saved;
      state.screen = "results";
      renderResultsFromSaved(saved);
    }
  } else if (action === "lesson") {
    showToast(`Lesson ${target.dataset.number} is part of your learning journey. Quiz yourself when you’re ready!`);
  } else if (action === "retry-load") {
    state.category = "All";
    state.query = "";
    initialize();
  }
});

function renderResultsFromSaved(saved) {
  const course = getCourse();
  if (!course) return renderDashboard();
  app.innerHTML = `<div class="quiz-shell"><header class="quiz-topbar"><button class="brand" data-action="dashboard"><span class="brand-mark">b</span><span>bloom<span class="brand-dot">.</span></span></button><div class="quiz-course-label"><span>YOUR LITTLE QUIZ</span><strong>${escapeHTML(course.title)}</strong></div><span class="result-header-note">One step at a time <span>✿</span></span></header>
    <main class="results-main"><div class="results-card"><div class="results-flower">${saved.score === 100 ? "✿" : saved.score >= 60 ? "✳" : "❋"}</div><div class="eyebrow">YOUR LAST LITTLE QUIZ</div><h1>${saved.score === 100 ? "Look at you, growing!" : saved.score >= 60 ? "That knowledge is taking root." : "Every try is a place to begin."}</h1><p class="results-subtitle">You showed up and gave it a go. That’s something to feel good about.</p><div class="score-circle" style="--score:${saved.score * 3.6}deg"><div><strong>${saved.score}<small>%</small></strong><span>YOUR SCORE</span></div></div>
      <div class="results-breakdown"><div><span class="breakdown-icon correct-icon">${icon("check", 17)}</span><strong>${saved.correct}</strong><span>correct</span></div><span class="breakdown-divider"></span><div><span class="breakdown-icon incorrect-icon">↻</span><strong>${saved.incorrect}</strong><span>incorrect</span></div><span class="breakdown-divider"></span><div><span class="breakdown-icon">${icon("clock", 16)}</span><strong>${course.quiz.length}</strong><span>questions</span></div></div>
      <div class="results-message"><span>✦</span><p>You’ve taken this quiz ${saved.attempts} ${saved.attempts === 1 ? "time" : "times"}. Every try teaches you something new.</p></div><div class="results-actions"><button class="primary-button" data-action="retry-quiz">${icon("arrow", 16)} Give it another go</button><button class="secondary-button" data-action="course-detail">${icon("book", 16)} Back to the course</button></div><button class="results-home-link" data-action="dashboard">Back to your learning space</button></div></main></div>`;
  applyTheme();
}

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    const selectionStart = event.target.selectionStart;
    state.query = event.target.value;
    renderDashboard(state.screen === "courses");
    const input = app.querySelector("[data-search]");
    input?.focus();
    input?.setSelectionRange(selectionStart, selectionStart);
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const search = app.querySelector("[data-search]");
    search?.focus();
  }
  if (state.screen === "quiz" && state.quiz && event.key === "ArrowRight" && state.quiz.index < getCourse().quiz.length - 1) {
    state.quiz.index += 1;
    renderQuiz();
  } else if (state.screen === "quiz" && state.quiz && event.key === "ArrowLeft" && state.quiz.index > 0) {
    state.quiz.index -= 1;
    renderQuiz();
  }
});

initialize();

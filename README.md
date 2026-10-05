# Bloom

A small, responsive learning app for exploring a course, tracking completion, and taking a timed quiz. It uses plain JavaScript modules and browser local storage; there are no dependencies, build step, account, or backend to configure.

## Run locally

From this folder, start a static file server:

```powershell
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project phases

1. **Course discovery and detail** — Browse four sample courses, search and filter by category, and open course descriptions and lesson summaries.
2. **Progress tracking** — Mark a course complete or undo completion. The course cards, learning dashboard, and overall progress update together.
3. **Course quizzes** — Take a five-question multiple-choice quiz for each course, with a five-minute timer, previous/next navigation, saved answers, and a results summary with retry.
4. **Persistence and UX** — Course completion and quiz scores persist in local storage. Responsive layouts, an optional dark appearance, loading/error/empty states, keyboard shortcuts, and accessible labels round out the experience.
5. **Validation** — Check the JavaScript syntax and test the main course, progress, quiz, persistence, and responsive flows in a browser.

## Project files

- `index.html` — App entry point and metadata.
- `styles.css` — Responsive design system, course/detail/quiz views, and dark appearance.
- `data.js` — Sample courses, lesson summaries, and quiz questions.
- `app.js` — Rendering, navigation, quiz timer, progress persistence, and UI states.

Progress is saved on the device in `localStorage`. Clearing browser storage removes saved completion and quiz results.

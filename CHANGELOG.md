# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-17

### Added
- User authentication via Auth.js v5 (Next.js App Router): Google OAuth and email magic link sign-in
- Prisma ORM with SQLite (dev) / Postgres-compatible schema — User, Account, Session, VerificationToken, QuizRecord models
- Login page (`/login`) matching existing dark theme — Google button + email magic link form with Suspense boundary
- Quiz history page (`/history`) — shows 50 most recent quizzes per user, newest first
- `QuizRecord` saved per authenticated user on every successful quiz generation (filename, page count, question JSON)
- `quizRecordId` returned from `/api/quiz` and stored in session state for future retake/share features
- Route protection via `proxy.ts` (Next.js 16 proxy convention) — unauthenticated users redirected to `/login` with `callbackUrl`
- `components/session-provider.tsx` — client-side `<SessionProvider>` wrapper for App Router compatibility

### Changed
- `/api/quiz` now requires authentication — returns 401 for unauthenticated requests
- Rate limiting replaced: IP-based in-memory limiter removed; per-user DB quota (5 requests / 60s via `QuizRecord` count) added
- API routes excluded from proxy matcher so `fetch()` calls receive 401 (not a redirect) on session expiry
- `QuizState` type extended with optional `quizRecordId?: string`

## [0.1.1] - 2026-03-16

### Added
- Dark-mode-first design system: deep slate/blue/indigo gradient applied across all pages
- Animated loading progress tracker (Upload → Extract → Generate steps with dot indicators)
- SVG circular score ring on results page with animated count-up effect
- Keyboard shortcuts in quiz: keys 1-4 to select answers, Enter to continue
- "Powered by Claude AI" pill badge on the landing page
- Letter labels (A/B/C/D) on answer options in quiz and results review
- Clear/remove button for selected PDF file in the upload zone
- File name badge (pill with PDF icon) on quiz and results pages
- Animated entrance effects: `fadeSlideUp`, `scorePop`, `glowPulse`, `iconBreathe`, `selectRipple`
- Progress bar shimmer animation using `::after` pseudo-element

### Changed
- `FileUpload` now accepts `selectedFile` and `onClear` props (controlled file state from parent)
- `QuizQuestion` now accepts `onNext` and `canGoNext` props for keyboard Enter navigation
- All spinner/button/card colors updated from blue to indigo palette
- Option rendering strips leading `A) / B) /…` prefixes added by the model
- Results answer review uses icon SVGs instead of emoji for correct/wrong/unanswered indicators
- Grade display changed from inline color text to bordered chip badges
- Error banners updated to use semi-transparent dark styling consistent with dark theme

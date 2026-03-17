# Changelog

All notable changes to this project will be documented in this file.

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

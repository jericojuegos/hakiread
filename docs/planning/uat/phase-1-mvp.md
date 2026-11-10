## UAT — Phase 1 MVP — 2026-03-21

### Happy Path
- [x] Read the diagnostic passage to completion
  - Steps: 1. Click Start Diagnostic → 2. Read with RSVP player to end → 3. Answer 3 questions → 4. Submit
  - Pass: Shows comprehension score and primary bottleneck generated correctly.
- [x] RSVP Player Basic Controls
  - Steps: 1. Start RSVP passage → 2. Press Space to pause/play → 3. Press up/down to adjust WPM → 4. Press left/right to skip sentences → 5. Click the 1, 2, 3 buttons to adjust chunks.
  - Pass: Text pauses correctly, WPM increases/decreases instantly, sentences can be skipped via arrows, and chunk size changes via buttons.
- [x] URL Scraper Route (`POST /api/documents/scrape`)
  - Steps: 1. Submit a valid article URL to the endpoint via Postman or script
  - Pass: Returns clean title, author, and `textContent` via Readability.js.
- [x] Diagnostic AI Route (`POST /api/diagnostic`)
  - Steps: 1. Submit raw metric payload (WPM, rewinds, primary bottleneck, score) via Postman or script
  - Pass: AI returns secondary bottleneck, vocabulary percentile, and a 2-3 sentence insight summary.

### Edge Cases
- [x] Scraper URL Validation
  - Steps: 1. Submit an invalid URL format or empty string to `/api/documents/scrape`
  - Pass: Returns `400 Bad Request` with Zod validation details.
- [x] Scraper HTML Failure
  - Steps: 1. Submit a URL that doesn't return HTML or blocked by paywall
  - Pass: Returns `500` with graceful `scrape_failed` JSON payload, no server crash.
- [x] Diagnostic AI API Validation
  - Steps: 1. Hit `/api/diagnostic` with missing score or WPM
  - Pass: Returns `400 Bad Request` with Zod details.
- [x] Submit Diagnostic Quiz Early
  - Steps: 1. Click submit quiz without answering all questions
  - Pass: Submit button is disabled until all 3 questions are answered.

### Security
- [x] Service Role Key Leak Check
  - Steps: 1. Inspect network tab during diagnostic and player use
  - Pass: No requests contain the Supabase service role key, all interactions pass through API routes safely.
- [x] AI Parameter Injection
  - Steps: 1. Submit heavily spoofed / extreme values (e.g. `rewinds: 99999`) to `/api/diagnostic`
  - Pass: Server doesn't crash; handles data cleanly and generates valid fallback AI response.

### Level 3 — Human Judgment
- [x] Does the RSVP player feel perfectly smooth at 500+ WPM without stuttering?
- [x] Do the AI-generated reading insights feel useful, accurate, and encouraging?
- [x] Does the Diagnostic passage layout look premium and responsive on both desktop and mobile?

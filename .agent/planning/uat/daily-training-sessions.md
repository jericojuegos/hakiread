# UAT Checklist: Daily Training Sessions

## Level 1: Automated Checks (Agent)
- [x] `pnpm tsc --noEmit` passes
- [x] `pnpm build` passes without errors

## Level 2: Feature Requirements (Agent)
- [x] AI Prompt integration (`sessionBuilder`) correctly references the user's Reading Profile primary bottleneck.
- [x] `POST /api/session/generate` returns structured JSON including the passage text and target WPM.
- [x] `POST /api/session/complete` correctly calculates XP based on `wordsRead × comprehension_score × SESSION_XP_FACTOR`.
- [x] User's `reading_profiles` table correctly tracks added XP, streak increment, and `last_session_at`.
- [x] Dashboard correctly queries and displays the user's XP and Streak.
- [x] The "Today's Session" button correctly routes to `/session/daily` which handles the session playback.

## Level 3: Human Judgment (User)
- [ ] Test the Dashboard XP and Streak visual design (does it look good and is it obvious?)
- [ ] Test the "Today's Session" button to start a session.
- [ ] Complete a session, answer the comprehension quiz, and verify that the "Session Complete!" summary accurately reflects XP gained.
- [ ] Return to the Dashboard and verify the total XP has cleanly incremented.

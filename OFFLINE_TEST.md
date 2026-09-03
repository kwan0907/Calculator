# Offline v1 test

This branch adds a non-destructive offline layer for the calculator.

## Current architecture
- GitHub stores the calculator files.
- Netlify deploys the site.
- The calculator data is already inside the app files; Supabase is not used.

## Test flow
1. Open `/offline.html` once while online.
2. Wait until the calculator opens normally.
3. Turn on airplane mode / disconnect network.
4. Close and reopen the installed PWA, or revisit `/offline.html`.
5. The cached calculator should open and remain usable offline.

## Scope
- `main` is unchanged.
- No calculator UI changes.
- No calculation logic changes.
- Only the static app shell is cached for offline use.

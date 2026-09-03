# Offline v1 test

This branch adds a non-destructive offline layer for the calculator.

## Test flow
1. Open `/offline.html` once while online.
2. Wait until the calculator opens normally.
3. Turn on airplane mode / disconnect network.
4. Close and reopen the installed PWA, or revisit `/offline.html`.
5. The app shell should open from cache.
6. Supabase REST GET responses that were successfully loaded online are cached and used as fallback when offline.

## Scope
- `main` is unchanged.
- No Supabase schema changes.
- No calculator UI or calculation logic changes.

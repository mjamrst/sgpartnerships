# SocialGlass mock boundary

All audiences, metrics, handles, captions, and signals are fictional. `trends.ts` contains 27 hand-authored signals. Runs return 16: five core signals that anchor the default story, plus eleven selected by a deterministic shuffle of audience names and the requested date range. The same inputs are reproducible; change audience selection or dates to vary the set and metrics. The service resolves database audience IDs to stable names before calling the adapter.

`SOCIALGLASS_MODE=mock` is the default. `live` fails explicitly until a real client is configured; it never silently labels mock observations as live.

Implement `SocialGlassAdapter` in `lib/socialglass/adapter.ts` with `createAudience`, `getTrends`, and `getAudienceComposition`, then select the implementation in `getSocialGlass()`. Map API responses into the existing types, normalize platform names, enforce access/exclusion filters upstream, convert metrics to the requested window, and retain source attribution and timestamps. Add server-only API credentials; UI components need no changes. Replace mock handles with authorized exemplar records, respecting platform access policies. Real API endpoints and authentication are intentionally not invented.

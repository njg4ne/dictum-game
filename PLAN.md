# Brief: URL-driven Latin Wordle (mod of "dictum")

## Goal
Fork the Wordle-style game at
https://github.com/Aurorum/latin-vocabulary-tester/tree/master/dictum
Keep its gameplay and look. Remove its built-in data/list options.
Instead, the word list comes from any JSON URL passed as a query parameter.

## Tech stack
- Static site on GitHub Pages, served from `/docs` on the main branch.
- PyScript 2026.7.3 (core.js/core.css from pyscript.net/releases/2026.7.3/),
  using MicroPython (`type="mpy"`) for fast load. Switch to `type="py"` (Pyodide)
  only if something needs full CPython.
- No build step, no bundler, no backend, no API keys.
- Add an empty `.nojekyll` file in `/docs`.
- Check the original repo's license and keep the attribution it requires.

## Repo layout
/docs/   index.html (+ any .py/.css)  ← the Pages site
/data/   *.json word lists (maintained by a non-technical editor via GitHub web upload)

NOTE: Pages serves only /docs, so /data is NOT on the Pages domain.
Load data via raw URLs, e.g.
https://raw.githubusercontent.com/<user>/<repo>/main/data/<file>.json
(These send `Access-Control-Allow-Origin: *`. This is already verified.)

## Data loading
- URL format: `index.html?vocab=<encoded JSON URL>`
- No `vocab` param → use a hardcoded default raw URL (data/all.json in this repo).
- Accept any http(s) JSON URL. Validate: must parse as JSON and yield ≥1 usable word.
- Cache: browser Cache API, store `dictum-data`, keyed by the resolved data URL.
  Value = the fetched JSON text, with the fetch time in an `X-Fetched-At` header.
  - Cache hit → use cached data, do NOT refetch.
  - Cache miss → fetch, validate, store, use.
  - Wrap all storage calls in try/catch. On quota or other storage errors,
    keep the data in memory and continue.
- Show a clear message if fetch or parse fails (CORS, 404, bad JSON). Don't crash.

## Data format (same as original vocab-lists/all.json)
An object keyed by id strings:
{ "1": { "word": "aciem", "full": "acies, aciei, f",
         "translation": "line, battle line, army", "type": "accs" }, ... }
- Also accept a plain array of the same entry objects.
- Use only entries whose `word` is 5 letters a–z (lowercase/trim it).
- Show `full`, `translation`, and `type` after the round, as the original does.

## Settings modal (new items)
- "Clear cached data": two buttons, one to clear the current URL's cache
  and one to delete the whole `dictum-data` cache. Then reload so the current URL
  refetches.
- Show the current data URL and when it was cached.
- "Copy share link": copies `location.origin + location.pathname + '?vocab=' +
  encodeURIComponent(currentUrl)`, where `currentUrl` is the resolved (absolute) data URL.

## Safety
- Write all data-derived text with `textContent`, never `innerHTML`.
- Never eval data.

## Done when
- Default list plays with no query param.
- A shared `?vocab=` link loads that list on first visit and comes from cache
  on later visits (verify in DevTools: no network request).
- Clearing the cache forces a refetch.
- A bad URL shows a friendly error.
- Works on mobile and on the GitHub Pages URL.
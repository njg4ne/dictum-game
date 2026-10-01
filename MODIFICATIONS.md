# Modifications from the original Dictum

This fork is **W&L Dictum**, by [njg4ne](https://github.com/njg4ne), for educational
purposes only. It is pending the upstream authors' approval
([discussion #25](https://github.com/Aurorum/latin-vocabulary-tester/discussions/25)).

This file is for agents and developers maintaining a branch of this project. It lists
every way this fork differs from the original, why each change was made, and how to
reverse or redirect it. [PLAN.md](PLAN.md) is the brief, [README.md](README.md) covers
attribution, and this file covers the differences.

## Upstream

- Source: https://github.com/Aurorum/latin-vocabulary-tester/tree/master/dictum
- Copied from commit `679d0d573c9b5cbc245135e4ea5622826d98d3d2` (fetched 2026-10-01).
- Upstream files used: `dictum/index.html`, `dictum/style.css`, `dictum/scripts.js` (as the
  reference for the port; it is not shipped), `dictum/vocab-lists/all.json` (now
  `data/all.json`), and 8 images from `/assets/` (now `docs/assets/`).
- **License: upstream has none** (no LICENSE file; GitHub reports `license: null`).
  The footer says "An open-source project by Aurorum". Permission has been requested
  in [discussion #25](https://github.com/Aurorum/latin-vocabulary-tester/discussions/25)
  (opened 2026-10-01) but not yet granted. Keep the credit in the footer and README on
  every branch.

To get a fresh copy of upstream for comparison:

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/Aurorum/latin-vocabulary-tester.git lvt
cd lvt && git sparse-checkout set dictum assets
```

## Summary

| Area | Original | This fork |
|---|---|---|
| Language | Vanilla JS (`scripts.js`) | Python running on MicroPython via PyScript 2026.7.3 (`docs/main.py`) |
| Word lists | 3 built-in lists (GCSE, AS-level, Any), chosen with buttons | One list, from `?vocab=<url>`, falling back to `DEFAULT_DATA_URL` |
| Guess validation | Guess must be in `valid.json` (8,849 words) | Guess must be in the loaded list |
| Data caching | Cache API, invalidated by the `VOCAB_LISTS_CACHE_VERSION` constant | Cache API store `dictum-data`, keyed by data URL; never invalidated automatically |
| Daily word | `selectedList[day]` (entry whose id is the day number) | `words[day % len(words)]` |
| Streak word | `random` index below a hardcoded size per list | `random.choice(words)` (repeats allowed) |
| Daily progress | Board `innerHTML` saved to localStorage `dailyWord` | List of guesses in localStorage `dictum:daily:<data url>` |
| Game state | Read back from the DOM (classes, tile text) | Python variables; the DOM only displays it |
| Event handlers | Inline `onclick=` attributes | `data-key` / `data-toggle` / ids, bound in `bind()` |
| Name and look | "Dictum", Montserrat/Open Sans, Wordle green/yellow/grey | "W&L Dictum", W&L logo, Palatino, W&L brand colors (`docs/theme.css`) |
| Analytics | Google Analytics, plus a POST of every event to a third-party server | Removed |
| Settings | None | Settings screen: data URL, cache time, copy share link, clear cache |

## Details

### 1. JavaScript → PyScript (MicroPython)

- `docs/index.html` loads `core.css`/`core.js` from `pyscript.net/releases/2026.7.3/` and
  runs `<script type="mpy" src="./main.py">`. There is no build step.
- Until Python has started, the page is inert. `#loading-warning` carries the `is-visible`
  class from the start, and `main()` removes it once loading finishes.
- **MicroPython gotcha: it truncates large JS numbers to 32 bits.** `window.Date.now()`
  comes back as a garbage negative int. As a result:
  - `today()` works out the day number from the UTC year, month and day using a
    days-from-civil formula, minus `EPOCH_DAY = 19035` (2022-02-12, the original's epoch).
  - Timestamps are stored as ISO strings (`toISOString()`), never as millisecond counts.
  - Never move millisecond timestamps between JS and Python on this runtime.
- JS interop: `window.X.new(...)` for constructors, `create_proxy` for event callbacks,
  `to_js` for option objects. Async work (animations, cache) runs through
  `asyncio.create_task`.
- `scripts.js`'s `findInflection` was ported line for line into `find_inflection`,
  **including its bugs** (e.g. type `pron` gives " singular present"). Fix them on purpose
  if you want to; don't do it by accident.

**Going back to JS:** start from upstream's `dictum/scripts.js` (clone it as shown above).
The DOM ids and CSS classes are unchanged, so the ported logic in `main.py` can be
converted function by function. Then:
replace `<script type="mpy">` and the PyScript tags with a plain script; keep `bind()`'s
approach (no inline `onclick`), or restore the inline handlers; and keep the data loading
and caching from `load_words()` (sections 2 and 3). In JS, `Date.now()` is safe, so
`today()` can go back to `Math.floor((Date.now() - 1644624000000) / 86400000)`, which
gives the same day numbers.

### 2. Word list loaded from a URL

- `get_data_url()`: the `?vocab=` query parameter (`VOCAB_PARAM`), or `DEFAULT_DATA_URL`, built from
  `owner`/`repo` (`njg4ne/dictum-game`). Change those two if the repo moves.
- `resolve()`: resolves against the page URL (so `?vocab=../data/all.json` works for local
  testing) and rejects anything that isn't http(s).
- "Copy share link" puts the resolved (absolute) URL in `?vocab=`, so a relative value
  like `../data/all.json` still works when the link is opened elsewhere.
- `extract_words()` accepts either an object keyed by id (sorted numerically, so the daily
  word is the same for everyone) or an array. It keeps only entries whose `word` is 5
  letters a–z after trimming and lowercasing, and returns
  `{word, full, translation, type}` dicts. Fewer than 1 usable word is an error.
- Errors become `ValueError` messages shown in `#load-error`. When that message is shown,
  the start buttons are dimmed and disabled with CSS.
- Removed from the HTML: the GCSE/AS/Any list buttons and `changeOption()`.

**Generating lists dynamically:** anything that produces the same JSON shape at an
http(s) URL with CORS headers works: a script that writes `data/*.json`, a serverless
endpoint, or a Google Sheet published as JSON. Two things to keep in mind:
1. Data is cached forever per URL. A dynamic endpoint at a fixed URL won't be refetched
   until the user clears the cache. Either put a version in the URL
   (`list.json?v=2`, `lists/2026-10-01.json`) or add expiry using `X-Fetched-At` in
   `load_words()`.
2. The daily word is `words[day % len(words)]`. Reordering, adding to or removing from a
   list changes which word is "today's" for that list, and resets the meaning of saved
   daily progress. `replay_daily()` re-scores saved guesses against the new target. If
   lists change often, consider choosing the daily word by a stable property, such as a
   hash of the date plus the word, instead of by position.

If you generate words client-side with no URL at all, add a code path in `main()` that
sets `words`/`word_set` directly and skips `load_words()`. Everything after loading only
uses those two globals.

### 3. Caching

- Cache API store `dictum-data`. Key: the resolved data URL. Value: the original response
  text with headers `Content-Type: application/json` and `X-Fetched-At: <ISO time>`.
- A cache hit means no network request. An unusable cached entry is deleted and the list
  is refetched.
- If the Cache API is unavailable (non-secure context, some private modes) or `put`
  fails, the list stays in memory only and Settings says "Not cached".
- Settings: "Clear cached data (this list)" runs `cache.delete(url)`; "(all lists)" runs
  `caches.delete("dictum-data")`. Both then reload the page.
- History: the first version of this fork used localStorage (`dictum:data:<url>` →
  `{fetchedAt, data}`), as PLAN.md originally specified. It was changed to the Cache API
  because of localStorage's ~5 MB limit and synchronous reads. There are no live users
  with old entries.

### 4. Guess validation

- `submit()` rejects any guess that isn't in `word_set`, the set of answer words from the
  loaded list, with the "Invalid word" shake.
- The original also accepted any word in `valid.json`. That file was **not** copied, at the
  owner's request ("any word in the list").

**Going back to the valid-words way:** add an optional second URL, e.g.
`?valid=<url>`, or a `"valid": [...]` key inside the data JSON. Load it next to the word
list (same caching code, different key), then set
`word_set = set(answers) | set(valid_words)`. Nothing else reads `word_set`. Upstream's
`dictum/vocab-lists/valid.json` is a flat array of strings, but it is unlicensed like the
rest of the upstream project.

### 5. Daily and streak state

- localStorage keys kept from the original, global and not per list: `gamesPlayed`,
  `answeredCorrectly`, `percentageStreak`, `scoresArray`, `dailyWordStreak`,
  `streaksGamesPlayed`, `streaksAnsweredCorrectly`, `streaksPercentageStreak`,
  `streaksScoreArray`, `streaksHighScore`.
- New keys: `dailyWordLastDay` (a day number; replaces the original's millisecond
  `dailyWordLastTime`, see the MicroPython gotcha), and `dictum:daily:<data url>` =
  `{"day": n, "guesses": [...]}`, replayed without animation by `replay_daily()`.
- Removed: `userID` and `dailyWord` (the board HTML).
- Stats are shared across all data lists. If you need stats per list, add the data URL
  to the key names in `build_stats()` and `record_result()`.
- The current streak count is in memory only, as in the original. A reload resets it.

### 6. Safety

- All text that comes from data is written with `textContent`. Nothing in `main.py` uses
  `innerHTML`, and the data is never evaluated (no `eval`), only parsed with `json.loads`.
- The original's "Try again" / "Next word" links were rebuilt with `innerHTML`. This fork
  uses a fixed `#next-streak-prefix` span plus `#next-word-link`, and only changes their
  text.

### 7. HTML/CSS changes

- `<head>`: removed the analytics, Open Graph tags pointing at latinvocabularytester.com,
  and the `scripts.js` tag; added PyScript and a `<!doctype>`.
- Asset paths changed from `../assets/` to `./assets/` (the files are copied into
  `docs/assets/`).
- Added a settings icon (`assets/settings.svg`, a gear drawn after Feather Icons' MIT-licensed
  "settings" icon, sized to match `stats.svg`/`help.svg`), a `#settings-screen`, and `#load-error`.
- Layout (in `theme.css`): `body` is a flex column filling the window (`min-height: 100dvh`):
  `<header class="site-header">` → `#game` (`flex: 1 0 auto`) → `<footer class="site-footer">`.
  The header and footer use new class names (`site-header`, `site-title`, `site-icons`,
  `site-footer`, `site-notice`) on purpose, so upstream's `.heading`, `.main-heading`,
  `.stats-icon` and `.footer` rules (fixed positioning, offsets, mobile `column-reverse`)
  don't apply and don't need overriding. Header: logo and title on the left, icons on the
  right, wrapping below about 360px. Footer: wraps, items aligned on the text baseline, and
  centered under 700px.
  Checked at 1440×1000, 1280×720, 390×844 and 320×568: no overlap, no sideways scroll.
- `.modal-wrapper` is changed from `overflow: scroll` to `overflow: auto` (in the `style.css`
  additions block). `scroll` always drew scrollbar tracks, which looked like a border
  around the modal.
  Instructions and option text now say "current word list".
- Footer: "fork by njg4ne" credit, links to upstream, and an "educational purposes only /
  pending approval" notice. Keep these on every branch.
- Title, heading and the "Copy score" text say "W&L Dictum". The heading includes
  `docs/assets/WL-logo.svg`. The Google Fonts link was removed.
- `style.css` is upstream's file unchanged, plus a block at the end marked
  `/* --- URL-driven data additions --- */`.
- Modal behavior fix: opening Stats, Help or Settings before a game starts and then
  closing it returns you to the option screen. In the original, this left no modal and no
  game.
- `theme.css` (loaded after `style.css`) holds all the W&L branding and only overrides
  colors and fonts, from the
  [W&L brand guide](https://my.wlu.edu/communications-and-public-affairs/washington-and-lee-university-brand-guide/color-and-typography).
  Tiles: Cannan Green `#00843D` (right place), Autumn Leaf `#F0B323` with W&L Blue text
  (in the word; white text fails contrast), Liberty Hall Grey `#707372` (not in the word).
  Accents are W&L Blue `#003087`, keys and borders Footbridge Grey, errors Brick, and the
  font is a Palatino stack. Brand rules: secondary colors must stay under half the
  palette, and the logo uses primary colors only (the SVG's own `#1F3D7B` fill is
  untouched). To remove the branding, delete `theme.css`, its `<link>`, and the logo
  `<img>`; the upstream look comes back, apart from the Google Fonts link, which you
  would need to restore.

## Debugging

- `find_word()` prints the answer to the browser console on every new word (daily start,
  streak start, next word). Remove it before release if spoilers matter.
- Local run: `python3 -m http.server 8000` from the repo root, then open
  `http://localhost:8000/docs/?vocab=../data/all.json`. Use `localhost`, not a LAN IP: the
  Cache API needs a secure context.
- `data/two.json` is a 2-word list for quick testing.

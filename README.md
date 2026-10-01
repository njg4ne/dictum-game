# W&L Dictum

A Latin Wordle for Washington and Lee that plays any JSON word list passed as
`?vocab=<url>`. Forked by [njg4ne](https://github.com/njg4ne) from Dictum by Aurorum,
**for educational purposes only**.
See [PLAN.md](PLAN.md) for the full brief.

- Site: `docs/` (served by GitHub Pages from `/docs` on `main`)
- Word lists: `data/*.json`, loaded via `raw.githubusercontent.com` URLs

## Attribution

Based on **Dictum** by Aurorum, part of
[latin-vocabulary-tester](https://github.com/Aurorum/latin-vocabulary-tester/tree/master/dictum)
([latinvocabularytester.com](https://latinvocabularytester.com)), copied from commit
`679d0d573c9b5cbc245135e4ea5622826d98d3d2`. The HTML, CSS, images, and `data/all.json`
come from that project; the game logic was ported from its JavaScript to Python.

All credit for the original game goes to its authors.

See [LICENSE](LICENSE): this fork's own changes are all rights reserved, and all rights
to the original material remain with its authors.

**This fork is pending approval.** The upstream repo has no license file, and permission
to make a derivative work has been requested in
[Aurorum/latin-vocabulary-tester discussion #25](https://github.com/Aurorum/latin-vocabulary-tester/discussions/25).
Until it's granted, all rights to the original material remain with Aurorum.

The W&L colors, typography and logo (`docs/assets/WL-logo.svg`) follow the
[W&L brand guide](https://my.wlu.edu/communications-and-public-affairs/washington-and-lee-university-brand-guide/color-and-typography).

## Local testing

    python3 -m http.server 8000
    open "http://localhost:8000/docs/?vocab=../data/all.json"

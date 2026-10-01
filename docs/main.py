# W&L Dictum (Latin Wordle), with the word list loaded from a ?vocab=<url> JSON URL.
# Game logic ported from https://github.com/Aurorum/latin-vocabulary-tester/tree/master/dictum
import asyncio
import json
import random

from pyscript import document, window
from pyscript.ffi import create_proxy, to_js

owner = "njg4ne"
repo = "dictum-game"
DEFAULT_DATA_URL = f"https://raw.githubusercontent.com/{owner}/{repo}/main/data/all.json"
VOCAB_PARAM = "vocab"  # query parameter holding the word list URL
CACHE_NAME = "dictum-data"  # Cache API store; entries keyed by the resolved data URL
FETCHED_AT_HEADER = "X-Fetched-At"
DAILY_PREFIX = "dictum:daily:"
EPOCH_DAY = 19035  # 2022-02-12 UTC, day 0 of the daily word, same as the original
COMPLETION_TEXT = ["ingeniosum!", "optimum!", "splendidum!", "mirabile!", "bonum!", "felix!"]

words = []  # list of {"word", "full", "translation", "type"}
word_set = set()
data_url = ""
cached_at = None  # ISO timestamp string, or None if only held in memory

started = False
is_daily = True
can_type = False
target = None
guesses = []  # submitted guesses for the current round
current = []  # letters typed in the current row
streak = 0


# ---------- helpers ----------

def el(id):
    return document.getElementById(id)


def on(node, event, fn):
    node.addEventListener(event, create_proxy(fn))


def each(selector):
    nodes = document.querySelectorAll(selector)
    return [nodes.item(i) for i in range(nodes.length)]


def store_get(key):
    try:
        return window.localStorage.getItem(key)
    except Exception:
        return None


def store_set(key, value):
    try:
        window.localStorage.setItem(key, value)
        return True
    except Exception:
        return False


def store_remove(key):
    try:
        window.localStorage.removeItem(key)
    except Exception:
        pass


def store_int(key, default=0):
    try:
        return int(store_get(key))
    except Exception:
        return default


def store_json(key, default):
    try:
        return json.loads(store_get(key))
    except Exception:
        return default


def today():
    # MicroPython truncates large JS numbers like Date.now(), so count days from the UTC date.
    d = window.Date.new()
    y, m, day = d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()
    y -= m <= 2
    era = y // 400
    yoe = y - era * 400
    doy = (153 * (m + (-3 if m > 2 else 9)) + 2) // 5 + day - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468 - EPOCH_DAY


def show_notice(text):
    el("game-notice-text").textContent = text
    el("game-notice").classList.remove("is-hidden")


def hide_notice():
    el("game-notice").classList.add("is-hidden")


# ---------- data loading ----------

def extract_words(data):
    if isinstance(data, dict):
        def order(k):
            return (0, int(k), "") if k.isdigit() else (1, 0, k)
        entries = [data[k] for k in sorted(data.keys(), key=order)]
    elif isinstance(data, list):
        entries = data
    else:
        return []
    out = []
    for e in entries:
        if not isinstance(e, dict) or not isinstance(e.get("word"), str):
            continue
        w = e["word"].strip().lower()
        if len(w) == 5 and all("a" <= c <= "z" for c in w):
            out.append({
                "word": w,
                "full": str(e.get("full") or ""),
                "translation": str(e.get("translation") or ""),
                "type": str(e.get("type") or ""),
            })
    return out


def get_data_url():
    params = window.URLSearchParams.new(window.location.search)
    if params.has(VOCAB_PARAM) and params.get(VOCAB_PARAM).strip():
        return params.get(VOCAB_PARAM).strip()
    return DEFAULT_DATA_URL


def resolve(url):
    """Absolute http(s) URL for a ?vocab= value. Raises ValueError."""
    try:
        resolved = window.URL.new(url, window.location.href)
    except Exception:
        raise ValueError("That isn't a valid URL.")
    if resolved.protocol not in ("http:", "https:"):
        raise ValueError("Only http(s) URLs are supported.")
    return resolved.href


async def open_cache():
    """The Cache API store, or None where unavailable (e.g. non-HTTPS, private mode)."""
    try:
        return await window.caches.open(CACHE_NAME)
    except Exception:
        return None


async def load_words(url):
    """Return (words, cached_at). Raises ValueError with a friendly message."""
    href = resolve(url)
    cache = await open_cache()

    if cache:
        try:
            hit = await cache.match(href)
            if hit:
                found = extract_words(json.loads(await hit.text()))
                if found:
                    return found, hit.headers.get(FETCHED_AT_HEADER)
            await cache.delete(href)  # missing or unusable entry
        except Exception:
            pass

    try:
        resp = await window.fetch(href)
    except Exception:
        raise ValueError("Couldn't reach it (network error, or the server doesn't allow cross-site requests).")
    if not resp.ok:
        raise ValueError("The server answered with HTTP " + str(resp.status) + ".")
    text = await resp.text()

    try:
        data = json.loads(text)
    except Exception:
        raise ValueError("It isn't valid JSON.")
    found = extract_words(data)
    if not found:
        raise ValueError("It has no usable 5-letter words.")

    # Store the original text verbatim; on quota or other errors just keep it in memory.
    fetched_at = window.Date.new().toISOString()
    try:
        headers = window.Headers.new()
        headers.set("Content-Type", "application/json")
        headers.set(FETCHED_AT_HEADER, fetched_at)
        await cache.put(href, window.Response.new(text, to_js({"headers": headers})))
        return found, fetched_at
    except Exception:
        return found, None


# ---------- modals ----------

def toggle(kind):
    body = document.body.classList
    cls = "is-displaying-" + kind
    if body.contains(cls):
        body.remove(cls)
        if started:
            body.remove("is-displaying-modal")
        return
    for other in ("stats", "instructions", "settings"):
        body.remove("is-displaying-" + other)
    if kind == "stats":
        build_stats()
    if kind == "settings":
        build_settings()
    body.add(cls)
    body.add("is-displaying-modal")


def build_settings():
    el("settings-url").textContent = data_url
    if cached_at:
        el("settings-cached").textContent = "Cached " + window.Date.new(cached_at).toLocaleString()
    else:
        el("settings-cached").textContent = "Not cached (kept in memory only)"


def share_link(event):
    # Share the absolute URL, so a relative ?vocab= value still works from elsewhere.
    try:
        url = resolve(data_url)
    except ValueError:
        url = data_url
    link = window.location.origin + window.location.pathname + "?" + VOCAB_PARAM + "=" + window.encodeURIComponent(url)
    window.navigator.clipboard.writeText(link)
    el("share-link").textContent = "Copied!"


async def clear_and_reload(all_lists):
    try:
        if all_lists:
            await window.caches.delete(CACHE_NAME)
        else:
            cache = await open_cache()
            await cache.delete(resolve(data_url))
    except Exception:
        pass
    window.location.reload()


def clear_this(event):
    asyncio.create_task(clear_and_reload(False))


def clear_all(event):
    asyncio.create_task(clear_and_reload(True))


# ---------- stats ----------

def build_stats():
    played = store_int("gamesPlayed")
    s_played = store_int("streaksGamesPlayed")
    el("daily-games-played").textContent = str(played)
    el("streaks-games-played").textContent = str(s_played)
    el("daily-answers-correct").textContent = str(store_int("percentageStreak")) + "%"
    el("streaks-answers-correct").textContent = str(store_int("streaksPercentageStreak")) + "%"
    el("daily-streak-count").textContent = str(store_int("dailyWordStreak"))
    el("streaks-highest").textContent = str(store_int("streaksHighScore"))

    for prefix, key in (("daily", "scoresArray"), ("streaks", "streaksScoreArray")):
        scores = store_json(key, {})
        values = [scores.get(str(i), 0) for i in range(1, 7)] + [scores.get("fail", 0)]
        total = sum(values)
        for i, v in enumerate(values):
            width = str(v / total * 100) + "%" if v and total else "1%"
            el(prefix + "-bar-" + str(i + 1)).style.width = width


def record_result(correct):
    prefix = "" if is_daily else "streaks"
    k = (lambda name: prefix + name[0].upper() + name[1:]) if prefix else (lambda name: name)

    played = store_int(k("gamesPlayed")) + 1
    right = store_int(k("answeredCorrectly")) + (1 if correct else 0)
    scores_key = "scoresArray" if is_daily else "streaksScoreArray"
    scores = store_json(scores_key, {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "fail": 0})
    slot = str(len(guesses)) if correct else "fail"
    scores[slot] = scores.get(slot, 0) + 1

    store_set(k("gamesPlayed"), str(played))
    store_set(k("answeredCorrectly"), str(right))
    store_set(k("percentageStreak"), str(round(right / played * 100)))
    store_set(scores_key, json.dumps(scores))

    if is_daily:
        store_set("dailyWordStreak", str(store_int("dailyWordStreak") + 1 if correct else 0))
        store_set("dailyWordLastDay", str(today()))
    elif streak > store_int("streaksHighScore"):
        store_set("streaksHighScore", str(streak))


# ---------- board ----------

def score(guess, answer):
    result = [None] * 5
    counts = {}
    for i in range(5):
        if guess[i] == answer[i]:
            result[i] = "is-correct-place"
        else:
            counts[answer[i]] = counts.get(answer[i], 0) + 1
    for i in range(5):
        if result[i] is None:
            if counts.get(guess[i], 0) > 0:
                result[i] = "is-contained"
                counts[guess[i]] -= 1
            else:
                result[i] = "is-not-contained"
    return result


def tile(row, i):
    return el("row" + str(row + 1) + "tile" + str(i))


def paint_tile(row, i, letter, cls):
    t = tile(row, i)
    t.parentNode.classList.add(cls)
    t.parentNode.classList.add("animate")
    el(letter + "-key").classList.add(cls)


def mark_row_done(row):
    r = el("row" + str(row + 1))
    r.classList.add("is-completed")
    r.classList.remove("is-not-completed")


def save_daily():
    if is_daily:
        store_set(DAILY_PREFIX + data_url, json.dumps({"day": today(), "guesses": guesses}))


def find_word():
    word = words[today() % len(words)] if is_daily else random.choice(words)
    print(f"Word is {word['word']} ({word['full']}, {word['translation']})")
    return word


def reset_board():
    global guesses, current, can_type
    for r in each(".game-row"):
        for c in ("is-completed", "is-answer", "bounce-animation", "shake-animation"):
            r.classList.remove(c)
        r.classList.add("is-not-completed")
    for t in each(".game-tile") + each(".keyboard button"):
        for c in ("is-contained", "is-not-contained", "is-correct-place", "animate"):
            t.classList.remove(c)
    for t in each(".game-tile-letter"):
        t.textContent = ""
    el("game-board").classList.remove("is-completed")
    hide_notice()
    el("copy-stats").style.display = "none"
    el("next-streak").style.display = "none"
    el("word-meaning").classList.add("is-hidden")
    el("copy-stats-link").textContent = "Copy score to clipboard"
    guesses = []
    current = []
    can_type = True


def finish(correct, fresh=True):
    global can_type, streak
    can_type = False
    el("copy-stats").style.display = "flex"
    if correct:
        el("row" + str(len(guesses))).classList.add("is-answer")
        el("game-board").classList.add("is-completed")
        show_notice(COMPLETION_TEXT[len(guesses) - 1])
    else:
        show_notice(target["word"].upper())

    if not is_daily:
        if correct:
            streak += 1
            el("next-streak-prefix").textContent = ""
            el("next-word-link").textContent = "Next word"
        else:
            el("next-streak-prefix").textContent = "eheu! "
            el("next-word-link").textContent = "Try again"
        el("current-streak").textContent = str(streak)
    el("next-streak").style.display = "block"

    el("word-inflection").textContent = find_inflection(target["type"])
    el("word-definition").textContent = target["translation"]
    el("word-root").textContent = target["full"]
    el("word-meaning").classList.remove("is-hidden")

    if fresh:
        record_result(correct)


async def reveal(row, guess, classes):
    global can_type
    for i in range(5):
        paint_tile(row, i, guess[i], classes[i])
        await asyncio.sleep(0.6)
    if guess == target["word"]:
        finish(True)
        await asyncio.sleep(0.3)
        el("row" + str(row + 1)).classList.add("bounce-animation")
    elif len(guesses) == 6:
        finish(False)
    else:
        can_type = True


async def shake(row):
    show_notice("Invalid word")
    el("row" + str(row + 1)).classList.add("shake-animation")
    await asyncio.sleep(1.4)
    hide_notice()
    el("row" + str(row + 1)).classList.remove("shake-animation")


def add_letter(letter):
    if can_type and len(current) < 5 and len(guesses) < 6:
        tile(len(guesses), len(current)).textContent = letter
        current.append(letter)


def remove_letter():
    if can_type and current:
        current.pop()
        tile(len(guesses), len(current)).textContent = ""


def submit():
    global can_type, current
    if not can_type or len(current) != 5:
        return
    row = len(guesses)
    guess = "".join(current)
    if guess not in word_set:
        asyncio.create_task(shake(row))
        return
    can_type = False
    hide_notice()
    guesses.append(guess)
    current = []
    mark_row_done(row)
    save_daily()
    asyncio.create_task(reveal(row, guess, score(guess, target["word"])))


def replay_daily():
    """Restore today's saved daily guesses without animation."""
    global current
    saved = store_json(DAILY_PREFIX + data_url, {})
    if saved.get("day") != today():
        return
    for g in saved.get("guesses", [])[:6]:
        if len(g) != 5:
            continue
        row = len(guesses)
        for i, (letter, cls) in enumerate(zip(g, score(g, target["word"]))):
            tile(row, i).textContent = letter
            paint_tile(row, i, letter, cls)
        guesses.append(g)
        mark_row_done(row)
        if g == target["word"] or len(guesses) == 6:
            finish(g == target["word"], fresh=False)
            return
    current = []


def copy_score(event):
    rows = []
    for g in guesses:
        marks = {"is-correct-place": "🟩", "is-contained": "🟨", "is-not-contained": "⬜"}
        rows.append("".join(marks[c] for c in score(g, target["word"])))
    solved = guesses and guesses[-1] == target["word"]
    day = str(today()) + " " if is_daily else ""
    text = "W&L Dictum (Latin Wordle) " + day + (str(len(guesses)) if solved else "X") + "/6\n"
    text += "\n".join(rows) + "\n\n" + window.location.href
    window.navigator.clipboard.writeText(text)
    el("copy-stats-link").textContent = "Copied to clipboard"


# ---------- game flow ----------

def start_game(daily):
    global started, is_daily, target
    if not words:
        return
    started = True
    is_daily = daily
    document.body.classList.add("is-daily-word" if daily else "is-streaks")
    reset_board()
    target = find_word()
    if daily:
        store_set("dailyWordLastDay", str(today()))
        replay_daily()
    document.body.classList.remove("is-displaying-modal")


def next_word(event):
    global streak, target
    if el("next-word-link").textContent == "Try again":
        streak = 0
        el("current-streak").textContent = "0"
    reset_board()
    target = find_word()


def on_key(event):
    if not started or event.ctrlKey or event.metaKey or event.altKey:
        return
    key = event.key
    if key == "Enter":
        event.preventDefault()
        submit()
    elif key == "Backspace":
        event.preventDefault()
        remove_letter()
    elif len(key) == 1 and "a" <= key.lower() <= "z":
        add_letter(key.lower())


def on_screen_key(event):
    key = event.currentTarget.dataset.key
    if key == "enter":
        submit()
    elif key == "back":
        remove_letter()
    else:
        add_letter(key)


# ---------- inflection labels (ported from the original) ----------

def find_inflection(form):
    full = ""
    for prefix, name in (("nom", "nominative"), ("voc", "vocative"), ("acc", "accusative"),
                         ("gen", "genitive"), ("dat", "dative"), ("abl", "ablative")):
        if form.startswith(prefix):
            full = name
            break
    full += " plural" if form.endswith("p") else " singular"

    for digit, name in (("1", "first-person"), ("2", "second-person"), ("3", "third-person")):
        if digit in form:
            full = name
            break

    i = 0
    while i < len(form) and not form[i].isdigit():
        i += 1
    number = form[i:]
    if number.endswith("s"):
        full += " singular"
    elif number.endswith("pl"):
        full += " plural"

    if form.startswith("pr"):
        full += " present"
    elif form.startswith("imp") and len(form) > 5:
        full += " imperfect"
    elif form.startswith("ft"):
        full += " future"
    elif form.startswith("pf"):
        full += " perfect"
    elif form.startswith("fp"):
        full += " future perfect"
    elif form.startswith("pl"):
        full += " pluperfect"

    if "acc" not in form and "ac" in form:
        full += " active"
    elif "pa" in form:
        full += " passive"

    if "suj" in form:
        full += " subjunctive"
    elif "ind" in form:
        full += " indicative"

    special = {
        "imps": "present singular imperative", "imppl": "present plural imperative",
        "infpr": "present infinitive", "infpf": "perfect infinitive",
        "pap": "present active participle", "ppp": "present passive participle",
        "adj": "adjective", "adv": "adverb", "conjunction": "conjunction", "pronoun": "pronoun",
    }
    return special.get(form, full)


# ---------- startup ----------

def check_daily_streak():
    last_day = store_int("dailyWordLastDay", None)
    if last_day is not None and today() - last_day > 1:
        store_set("dailyWordStreak", "0")


def bind():
    for node in each("[data-toggle]"):
        kind = node.dataset.toggle
        on(node, "click", lambda e, kind=kind: toggle(kind))
    for node in each(".keyboard button"):
        on(node, "click", on_screen_key)
    on(el("start-daily"), "click", lambda e: start_game(True))
    on(el("start-streaks"), "click", lambda e: start_game(False))
    on(el("next-word-link"), "click", next_word)
    on(el("copy-stats-link"), "click", copy_score)
    on(el("share-link"), "click", share_link)
    on(el("clear-this"), "click", clear_this)
    on(el("clear-all"), "click", clear_all)
    on(document, "keydown", on_key)


async def main():
    global words, word_set, data_url, cached_at
    bind()
    check_daily_streak()
    data_url = get_data_url()
    try:
        words, cached_at = await load_words(data_url)
        word_set = set(w["word"] for w in words)
    except ValueError as err:
        el("load-error").textContent = "Couldn't load the word list from " + data_url + ". " + str(err)
        el("load-error").classList.add("is-visible")
    el("loading-warning").classList.remove("is-visible")


await main()

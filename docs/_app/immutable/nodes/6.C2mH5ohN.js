import{B as e,C as t,Ct as n,F as r,G as i,H as a,I as o,L as s,Q as c,S as l,T as u,V as d,X as f,at as p,d as m,dt as h,ft as g,g as _,h as v,it as y,j as b,lt as x,ot as S,pt as C,rt as w,tt as T,v as E,vt as D,wt as O,x as k,yt as A}from"../chunks/6klcJOIi.js";import{n as j}from"../chunks/y0gnEyWl.js";import"../chunks/Oqdn27hV.js";import{t as M}from"../chunks/DdUt8j2x.js";import{n as N}from"../chunks/V7uTxMlV.js";import{n as P,t as ee}from"../chunks/CW1j4b7e.js";import{l as F,n as I,u as L}from"../chunks/WqgKg6OP.js";var R={"Team Pons":[{name:`Senitha Senaratne`},{name:`Fahad Waqar`}],"Team Lux":[{name:`Adriana Aviles-Reynado`},{name:`Kyle Patterson`}],"Team Silva":[{name:`Carden Zhang`},{name:`Diego Gutierrez`}],"Team Via":[{name:`Boris Pekar`},{name:`Ray Hutton`}],"Team Mons":[{name:`Candice Choi`},{name:`Ismoil Salimov`},{name:`Hallie Nguyen`}]},z=s(`<a target="_blank" rel="noreferrer noopener"> </a>`),B=s(` <!>`,1),V=s(`<span class="names">(<!>)</span>`),H=s(` <span class="credit svelte-1r1seda"><!><strong class="svelte-1r1seda"> </strong> <!></span>`,1);function U(a,s){let d=R;var f=o(),h=y(f);l(h,17,()=>s.teams,t,(a,o,s)=>{n();var f=H(),h=y(f,!0);h.nodeValue=s?` · `:``;var g=S(h),_=w(g);M(_,{name:`students`,size:20});var v=S(_),x=p(v,!0),C=S(v,2),T=a=>{var s=V(),f=S(w(s));l(f,17,()=>d[i(o)],t,(t,a,o)=>{n();var s=B(),l=y(s,!0);l.nodeValue=o?`, `:``;var d=S(l),f=e=>{var t=z(),n=p(t,!0);c(()=>{m(t,`href`,i(a).url),b(n,i(a).name)}),r(e,t)},h=t=>{var n=e();c(()=>b(n,i(a).name)),r(t,n)};u(d,e=>{i(a).url?e(f):e(h,-1)}),r(t,s)}),n(),O(s),r(a,s)};u(C,e=>{d[i(o)]&&e(T)}),O(g),c(()=>b(x,i(o))),r(a,f)}),r(a,f)}var W=`"""Crowdsourced tests for engine.py: the best idea from each student team, without repeats.

Each test names the team(s) whose test inspired it (@credit). The instructor page runs this file in
the browser ("Engine tests" panel), and \`npm test\` runs it in plain Python.
Tests that only made sense for a team's own internal functions (mocking their helpers) were
re-expressed as behavior checks on the public API, build_word_file().

To remove this feature: delete this file, src/lib/components/EngineTests.svelte, and its
<EngineTests /> line in src/routes/instructor/+page.svelte. (Or set SHOW_ENGINE_TESTS = false in config.ts.)
"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import engine
from omnes_formae import PartOfSpeech as P

# Team ids ("Team Pons", ...) are anonymous. Who is on each team lives only in credits/students.csv.


def credit(*teams):
    """Marks which team(s) wrote the test that inspired this one."""
    def mark(test):
        test.credit = teams
        return test
    return mark


def build(chapters, pos, tags=None):
    """Runs the engine into a temp folder; returns (count, parsed json)."""
    out = Path(tempfile.mkdtemp()) / "words.json"
    count = engine.build_word_file(str(out), chapters, pos, tags or {})
    return count, json.loads(out.read_text(encoding="utf-8"))


class EngineTests(unittest.TestCase):
    # ----- the basics -----
    @credit("Team Lux", "Team Via")
    def test_honor_pledge(self):
        """The honor pledge starts with "On our honor" and ends with "on this lab."."""
        self.assertTrue(engine.honor_pledge().startswith("On our honor"))
        self.assertTrue(engine.honor_pledge().endswith("on this lab."))

    @credit("Team Lux")
    def test_returns_the_number_of_words_as_an_int(self):
        """build_word_file returns how many words it saved, as an integer."""
        count, data = build([1], [P.VERB], {"tense": ["present"], "mood": ["indicative"], "number": ["plural"]})
        self.assertIsInstance(count, int)
        self.assertEqual(count, len(data))

    @credit("Team Via")
    def test_chapter_one_every_part_of_speech(self):
        """Chapter 1 with every part of speech and no tag choices gives 95 words."""
        self.assertEqual(build([1], list(P))[0], 95)

    @credit("Team Lux", "Team Via")
    def test_entries_are_numbered_and_have_the_four_fields(self):
        """Entries are keyed "1", "2", ... and each has word, full, translation and type."""
        _, data = build([1], [P.NOUN, P.VERB])
        self.assertEqual(list(data), [str(i) for i in range(1, len(data) + 1)])
        self.assertTrue(all(set(e) == {"word", "full", "translation", "type"} for e in data.values()))

    @credit("Team Mons")
    def test_spot_check_a_known_form(self):
        """"amant" (present active indicative 3rd person plural of amo) is in the chapter 1 verbs."""
        _, data = build([1], [P.VERB], {"tense": ["present"], "mood": ["indicative"], "number": ["plural"]})
        entry = next(e for e in data.values() if e["word"] == "amant")
        self.assertEqual(entry["full"], "amo, amare, amavi, amatum")
        self.assertEqual(entry["type"], "present active indicative 3rd person plural")

    # ----- looking words up -----
    @credit("Team Via")
    def test_odisse_is_looked_up_by_its_first_real_word(self):
        """"-, odisse, odi, osurum" is found, and only five-letter forms are written."""
        _, data = build([20], [P.VERB])
        self.assertIn("odere", {e["word"] for e in data.values()})
        self.assertTrue(all(len(e["word"]) == 5 for e in data.values()))

    @credit("Team Lux")
    def test_composite_labels_match_any_of_their_parts(self):
        """"adjective, cardinal" counts as a numeral, and "verb (3i)" as a verb."""
        self.assertEqual(engine._categories_of("adjective, cardinal"), {P.ADJECTIVE, P.NUMERAL})
        self.assertEqual(engine._categories_of("verb (3i)"), {P.VERB})

    @credit("Team Pons")
    def test_one_failed_lookup_is_skipped(self):
        """If the library fails on one word, the rest of the list is still built."""
        real = engine.get_latin_forms
        def flaky(word, pos=None):
            if word.startswith("amo,"):
                raise KeyError(word)
            return real(word, pos)
        with patch.object(engine, "get_latin_forms", flaky):
            count, data = build([1], [P.VERB])
        self.assertGreater(count, 0)
        self.assertNotIn("amant", {e["word"] for e in data.values()})

    # ----- choosing parts of speech -----
    @credit("Team Via")
    def test_only_nouns_are_kept_when_nouns_are_chosen(self):
        """Choosing nouns only keeps noun forms: no verb forms such as "amant" sneak in."""
        _, data = build([1, 2, 3], [P.NOUN])
        self.assertGreater(len(data), 0)
        self.assertNotIn("amant", {e["word"] for e in data.values()})
        self.assertFalse(any("indicative" in e["type"] for e in data.values()))

    @credit("Team Via")
    def test_parts_of_speech_can_be_enums_codes_or_names(self):
        """PartOfSpeech.NOUN, "N" and "noun" all mean the same thing."""
        counts = {build([1, 2], [choice])[0] for choice in (P.NOUN, "N", "noun", " Noun ")}
        self.assertEqual(len(counts), 1)

    @credit("Team Via")
    def test_chosen_verbs_do_not_include_participles(self):
        """Choosing verbs gives verb forms only; participles need to be chosen on their own."""
        _, data = build([20], [P.VERB])
        self.assertFalse(any("participle" in e["type"] for e in data.values()))

    # ----- choosing tags -----
    @credit("Team Mons", "Team Via", "Team Lux")
    def test_nouns_survive_a_tense_choice(self):
        """Nouns have no tense, so choosing "present" must not remove them."""
        _, data = build([1, 2, 3], [P.NOUN], {"tense": ["present"]})
        self.assertGreater(len(data), 0)

    @credit("Team Lux")
    def test_a_tag_choice_keeps_only_matching_forms(self):
        """Choosing "plural" removes every singular form."""
        _, data = build([1, 2, 3], [P.NOUN], {"number": ["plural"]})
        self.assertGreater(len(data), 0)
        self.assertFalse(any("singular" in e["type"] for e in data.values()))

    @credit("Team Mons")
    def test_empty_tag_choices_keep_everything(self):
        """No tag choices (and an empty list of values for an unknown tag) change nothing."""
        everything = build([1], [P.NOUN])[0]
        self.assertEqual(build([1], [P.NOUN], {})[0], everything)
        self.assertEqual(build([1], [P.NOUN], {"not_a_tag": ["x"]})[0], everything)

    @credit("Team Via")
    def test_tag_choices_ignore_letter_case(self):
        """"Nominative" and "nominative" give the same list."""
        self.assertEqual(build([1, 2], [P.NOUN], {"case": ["Nominative"]})[0], build([1, 2], [P.NOUN], {"case": ["nominative"]})[0])

    # ----- empty and odd input -----
    @credit("Team Lux", "Team Silva", "Team Via")
    def test_no_parts_of_speech_saves_an_empty_file(self):
        """Nothing chosen still writes a valid, empty JSON object."""
        self.assertEqual(build([1], []), (0, {}))

    @credit("Team Silva")
    def test_no_chapters_saves_an_empty_file(self):
        """No chapters gives an empty list."""
        self.assertEqual(build([], list(P)), (0, {}))

    @credit("Team Pons")
    def test_unknown_chapter_does_not_crash(self):
        """A chapter that does not exist (999) is simply empty."""
        self.assertEqual(build([999], list(P)), (0, {}))

    @credit("Team Via")
    def test_missing_folders_are_created(self):
        """Saving to a path in a folder that does not exist yet creates the folder."""
        out = Path(tempfile.mkdtemp()) / "a" / "b" / "words.json"
        engine.build_word_file(str(out), [1], [P.NOUN], {})
        self.assertTrue(out.exists())

    # ----- the words themselves -----
    @credit("Team Lux", "Team Via", "Team Mons")
    def test_each_spelling_appears_once(self):
        """The same spelling from two different words is only listed once."""
        _, data = build(list(range(1, 41)), list(P))
        words = [e["word"] for e in data.values()]
        self.assertEqual(len(words), len(set(words)))

    @credit("Team Via")
    def test_words_are_five_lowercase_letters(self):
        """Every word is exactly five letters a-z (no capitals, accents or punctuation).

        Found while profiling: proper names such as "Asiae" came through in every submission.
        """
        _, data = build(list(range(1, 41)), list(P))
        self.assertTrue(all(len(e["word"]) == 5 and e["word"].isascii() and e["word"].islower() for e in data.values()))

    @credit("Team Via")
    def test_the_ui_can_ask_what_to_offer(self):
        """available_choices() lists chapters 1-40, the parts of speech and the tag values."""
        choices = engine.available_choices()
        self.assertEqual(choices["chapters"], list(range(1, 41)))
        self.assertIn("noun", choices["parts_of_speech"])
        self.assertIn("present", choices["tags"]["tense"])

    @credit("Team Silva")
    def test_no_network_is_needed(self):
        """Building a list works with every network connection blocked."""
        import socket
        def blocked(*args, **kwargs):
            raise OSError("network is off")
        with patch.object(socket.socket, "connect", blocked):
            self.assertGreater(build([1], [P.NOUN])[0], 0)


def _suite() -> list:
    return list(unittest.defaultTestLoader.loadTestsFromTestCase(EngineTests))


def _result(test) -> dict:
    outcome = unittest.TestResult()
    test.run(outcome)
    problems = outcome.failures + outcome.errors
    method = getattr(EngineTests, test._testMethodName)
    return {
        "name": test._testMethodName.removeprefix("test_").replace("_", " "),
        "description": (method.__doc__ or "").strip().splitlines()[0],
        "teams": list(method.credit),
        "ok": not problems,
        "message": problems[0][1].strip().splitlines()[-1] if problems else "",
    }


def list_tests() -> str:
    """JSON list of the test names, so the page can run them one at a time and show real progress."""
    return json.dumps([test._testMethodName for test in _suite()])


def run_one(method_name: str) -> str:
    """Runs one test; returns JSON the page displays: {name, description, teams, ok, message}."""
    test = next(t for t in _suite() if t._testMethodName == method_name)
    return json.dumps(_result(test))


def run_all() -> str:
    """Runs every test; returns JSON the page displays: [{name, description, teams, ok, message}]."""
    return json.dumps([_result(test) for test in _suite()])


if __name__ == "__main__":
    unittest.main()
`,G=s(`<p class="muted svelte-6qqtvj" role="status"> </p> <!>`,1),te=s(`<p class="error" role="alert"> </p>`),K=s(`<p class="error svelte-6qqtvj"> </p>`),ne=s(`<li class="svelte-6qqtvj"><strong class="result svelte-6qqtvj"><span><!></span> </strong> <p class="svelte-6qqtvj"> </p> <p class="svelte-6qqtvj">Idea from <!></p> <!></li>`),q=s(`<p role="status" class="summary svelte-6qqtvj"><span><!></span> <span><strong> </strong> passing</span></p> <ol class="files svelte-6qqtvj"></ol>`,1),re=s(`<div class="panel"><p>Checks the Python engine with tests gathered from the best of the students' own. Each test credits the team that thought of it. The first run downloads the Python runtime (about 14 MB, kept by your browser afterwards).</p> <button class="btn"><!> </button> <div class="progress svelte-6qqtvj"><!></div> <!> <!></div>`);function J(e,o){A(o,!0);let s=h(void 0),d=h(`idle`),f=h(``),m=h(0),T=h(1),E=h(!1),k=[],j=C(()=>i(s)?.filter(e=>e.ok).length??0);async function P(){x(f,``),x(s,void 0),x(d,`starting`);try{let{py:e}=await F();e.FS.writeFile(`/engine/engine_tests.py`,W);let t=e.pyimport(`engine_tests`),n=JSON.parse(t.list_tests());x(T,n.length,!0),x(m,0),x(E,!1),k=[],x(d,`testing`);for(let e of n)await new Promise(e=>setTimeout(e,30)),k.push(JSON.parse(t.run_one(e))),g(m);x(E,!0)}catch(e){x(f,e instanceof Error?e.message:String(e),!0),x(d,`idle`)}}function ee(){x(s,k,!0),x(d,`idle`)}var I=re(),L=S(w(I),2),R=w(L);M(R,{name:`tests`,size:20});var z=S(R,1,!0);O(L);var B=S(L,2),V=w(B),H=e=>{var t=G(),n=y(t),a=p(n),o=S(n,2);{let e=C(()=>i(m)/i(T));N(o,{label:`Running the engine tests`,get done(){return i(E)},get real(){return i(e)},minMs:500,onfinish:ee})}c(e=>b(a,`Running test ${e??``} of ${i(T)??``}…`),[()=>Math.min(i(m)+1,i(T))]),r(e,t)};u(V,e=>{i(d)===`testing`&&e(H)}),O(B);var J=S(B,2),ie=e=>{var t=te(),n=p(t,!0);c(()=>b(n,i(f))),r(e,t)};u(J,e=>{i(f)&&e(ie)});var ae=S(J,2),oe=e=>{var a=q(),o=y(a),d=w(o),f=w(d);{let e=C(()=>i(j)===i(s).length?`pass`:`fail`);M(f,{get name(){return i(e)},size:26})}O(d);var m=S(d,2),h=w(m),g=p(h);n(),O(m),O(o);var x=S(o,2);l(x,21,()=>i(s),t,(e,t)=>{var n=ne(),a=w(n),o=w(a),s=w(o);{let e=C(()=>i(t).ok?`pass`:`fail`);M(s,{get name(){return i(e)},size:22})}O(o);var l=S(o);O(a);var d=S(a,2),f=p(d,!0),m=S(d,2);U(S(w(m)),{get teams(){return i(t).teams}}),O(m);var h=S(m,2),g=e=>{var n=K(),a=p(n,!0);c(()=>b(a,i(t).message)),r(e,n)};u(h,e=>{i(t).ok||e(g)}),O(n),c(()=>{v(o,1,_(i(t).ok?`tone-pass`:`tone-fail`)),b(l,` ${i(t).ok?`Pass`:`Fail`}: ${i(t).name??``}`),b(f,i(t).description)}),r(e,n)}),O(x),c(()=>{v(d,1,_(i(j)===i(s).length?`tone-pass`:`tone-fail`)),b(g,`${i(j)??``} of ${i(s).length??``}`)}),r(e,a)};u(ae,e=>{i(s)&&e(oe)}),O(I),c(()=>{L.disabled=i(d)!==`idle`,b(z,i(d)===`starting`?`Getting Python ready…`:i(d)===`testing`?`Running the tests…`:i(s)?`Run again`:`Run tests`)}),a(`click`,L,P),r(e,I),D()}d([`click`]);var ie=[{team:`Team Via`,title:`Accept a part of speech as an enum, a code, or a plain name`,why:`Callers can pass PartOfSpeech.NOUN, "N" or "noun". The engine and its UI rely on this.`,file:`main.py`,line:109,engine:`_as_part_of_speech`,code:`def _as_part_of_speech(value: PartOfSpeech | str) -> PartOfSpeech | None:
    """Normalize enum and readable part-of-speech inputs."""
    if isinstance(value, PartOfSpeech):
        return value
    if not isinstance(value, str):
        return None

    readable_names = {
        "noun": PartOfSpeech.NOUN,
        "pronoun": PartOfSpeech.PRONOUN,
        "adjective": PartOfSpeech.ADJECTIVE,
        "numeral": PartOfSpeech.NUMERAL,
        "adverb": PartOfSpeech.ADVERB,
        "verb": PartOfSpeech.VERB,
        "preposition": PartOfSpeech.PREPOSITION,
        "conjunction": PartOfSpeech.CONJUNCTION,
        "interjection": PartOfSpeech.INTERJECTION,
    }
    try:
        return PartOfSpeech(value)
    except ValueError:
        return readable_names.get(value.strip().casefold())`},{team:`Team Via`,title:`Ask the data what can be chosen`,why:`The instructor page builds its chapter checkboxes from the vocabulary instead of hard-coding 1-40.`,file:`main.py`,line:14,engine:`available_choices`,code:`def available_choices(file_path: str) -> tuple[list[int], list[str]]:
    """Return the sorted chapters and parts of speech in a vocabulary CSV."""
    with open(file_path, newline="", encoding="utf-8") as vocab_file:
        rows = list(csv.DictReader(vocab_file))

    chapters = sorted({int(row["Chapter"]) for row in rows})
    parts_of_speech = sorted({row["Part of Speech"].strip() for row in rows})
    return chapters, parts_of_speech`},{team:`Team Via`,title:`Create the output folder if it is missing`,why:`Saving to a/b/words.json works even when a/b does not exist yet: a careful detail.`,file:`main.py`,line:146,engine:`build_word_file`,code:`output_file_path = Path(file_path)
output_file_path.parent.mkdir(parents=True, exist_ok=True)`},{team:`Team Via`,title:`Skip vocabulary rows with a missing cell`,why:`One blank Latin or English cell does not break the whole list.`,file:`main.py`,line:152,engine:`load_vocab`,code:`if not row.get("Latin") or not row.get("English"):
    continue`},{team:`Team Lux`,title:`Map textbook labels to the library's part-of-speech codes`,why:`Cardinals and ordinals count as numerals, and pronouns include the qu- pronouns (PACKON).`,file:`get_vocab_by_pos.py`,line:6,engine:`CATEGORIES`,code:`_POS_LABELS = {
    "noun": {PartOfSpeech.NOUN},
    "verb": {PartOfSpeech.VERB},
    "pronoun": {PartOfSpeech.PRONOUN, PartOfSpeech.PACKON},
    "adjective": {PartOfSpeech.ADJECTIVE},
    "cardinal": {PartOfSpeech.NUMERAL},
    "ordinal": {PartOfSpeech.NUMERAL},
    "adverb": {PartOfSpeech.ADVERB},
    "preposition": {PartOfSpeech.PREPOSITION},
    "conjunction": {PartOfSpeech.CONJUNCTION},
    "interjection": {PartOfSpeech.INTERJECTION},
    "prefix": {PartOfSpeech.PREFIX},
}`},{team:`Team Lux`,title:`Choose the vocabulary rows first, look up forms last`,why:`Filtering by chapter and part of speech before the slow library lookup made this the fastest design.`,file:`main.py`,line:26,engine:`build_word_file`,code:`#Step 1 : Get the vocabulary from the CSV file
vocab = get_vocab()

#Step 2 : Filter vocabulary for the chosen chapters
filtered_vocab_1 = filter_by_chapters(vocab, chapters)

#Step 3 : Filter vocabulary for the chosen parts of speech
filtered_vocab_2 = filter_by_pos(filtered_vocab_1, parts_of_speech)

#Step 4 : Get every form of each word, filtered simultaneously for tag and length of five
wordle_words = get_all_forms(filtered_vocab_2, tag_choices, parts_of_speech)`},{team:`Team Lux`,title:`A form passes a tag choice if it lacks that tag`,why:"`tag_part not in row or ...`: nouns have no tense, so a tense choice must not remove them.",file:`should_keep_row.py`,line:2,engine:`_matches_tags`,code:`def should_keep_row(row: dict, tag_choices: dict[str, list[str]]) -> bool:
    """
    Keep five-letter forms whose tag components match all supplied choices.

    Parameters:
    row: A form row returned by omnes_formae.
    tag_choices: Tag component names mapped to allowed values, such as
        {"tense": ["present"], "number": ["plural"]}.

    Returns:
    True when the form has five letters and every selected tag component
    matches. An empty tag_choices keeps all tag components.
    """
    return len(row["word"]) == 5 and all(
        tag_part not in row or row[tag_part] in values
        for tag_part, values in tag_choices.items()
    )`},{team:`Team Mons`,title:`Notice that nouns have no tense`,why:`An explicit special case for the same problem, found independently.`,file:`filter.py`,line:31,engine:`_matches_tags`,code:`def filter_tags(vocab_list: list[dict], tag_choices: dict[str, list[str]]) -> list[dict]:
    """Filter entries by grammatical tags while preserving nouns for tense filters."""
    if tag_choices == {}:
        return vocab_list
    for tag, choices in tag_choices.items():
        vocab_list = [
            entry
            for entry in vocab_list
            if (
                tag == "tense"
                and entry.get("pos") == PartOfSpeech.NOUN
            )
            or entry.get(tag) in choices
        ]
    return vocab_list`},{team:`Team Silva`,title:`Nouns skip the tense filter`,why:`The same observation again, from a third team.`,file:`main.py`,line:39,engine:`_matches_tags`,code:`if tag == "tense" and row["pos"] == PartOfSpeech.NOUN:
    continue`},{team:`Team Pons`,title:`One failed lookup must not stop the list`,why:`A word the library cannot look up is skipped, and the rest of the list is still built.`,file:`main.py`,line:43,engine:`build_word_file`,code:`try:
    forms = get_latin_forms(lemma)
except Exception:
    continue`}],ae=s(`<a target="_blank" rel="noreferrer noopener"> </a>`),oe=s(` <!>`,1),se=s(`<a href="#nouns-tense">Why this matters</a>`),ce=s(`<li class="svelte-12q9p71"><h4 class="svelte-12q9p71"><!> </h4> <p class="names svelte-12q9p71"></p> <p class="svelte-12q9p71"> <!></p></li>`),le=s(`<li><p class="by svelte-12q9p71"><!></p> <p class="svelte-12q9p71"><strong> </strong> <!><!></p></li>`),ue=s(`<!> Run their tests`,1),de=s(`<section aria-labelledby="tests" class="svelte-12q9p71"><!> <!></section>`),fe=s(`<!> Their code`,1),pe=s(`<figure class="svelte-12q9p71"><figcaption class="svelte-12q9p71"><p class="by svelte-12q9p71"><!></p> <p class="svelte-12q9p71"><strong> </strong> <code> </code> in <code>engine.py</code>.</p></figcaption> <!></figure>`),me=s(`<h2>The students' engine</h2> <p class="lead svelte-12q9p71">Every word you guess starts in a piece of Python that students wrote. The <strong>engine</strong> reads the <a href="http://www.wheelockslatin.com/">Wheelock's Latin</a> vocabulary, finds every form each word can take, and builds the lists the game plays. Without it there would be
	no Latin to guess. It runs in your browser, not on a server.</p> <ul class="numbers svelte-12q9p71" aria-label="The students' work in numbers"><li class="svelte-12q9p71"><!><strong class="svelte-12q9p71"> </strong><span class="svelte-12q9p71">teams</span></li> <li class="svelte-12q9p71"><!><strong class="svelte-12q9p71"> </strong><span class="svelte-12q9p71">students</span></li> <li class="svelte-12q9p71"><!><strong class="svelte-12q9p71">720</strong><span class="svelte-12q9p71">lines of Python</span></li> <li class="svelte-12q9p71"><!><strong class="svelte-12q9p71">84</strong><span class="svelte-12q9p71">tests</span></li> <li class="svelte-12q9p71"><!><strong class="svelte-12q9p71">54</strong><span class="svelte-12q9p71">submissions</span></li></ul> <p class="muted">The teams wrote about 720 lines of Python in all, and the course's automatic grader checked 54 submissions over five days.</p> <p>The engine in <code>src/lib/engine/engine.py</code> combines the best ideas from the five teams' submissions to the course's
	data-engine assignment, rewritten from scratch around ideas the students had first. Each team solved the problem in a
	different shape, from one compact file to several small ones, and each shape taught something. Every team's final
	submission passed all of the automatic checks.</p> <!> <section aria-labelledby="teams" class="svelte-12q9p71"><!> <p class="muted gloss">The teams are named with short Latin words: <em>Lux</em> (light), <em>Mons</em> (mountain), <em>Pons</em> (bridge), <em>Silva</em> (forest) and <em>Via</em> (road).</p> <ul class="teams svelte-12q9p71"></ul></section> <section aria-labelledby="techniques" class="svelte-12q9p71"><!> <p>Congratulations to every team whose ideas are in the engine. These were first-semester programmers, and each choice below is a
		real engineering choice.</p> <ul class="techniques svelte-12q9p71"></ul></section> <section aria-labelledby="nouns-tense" class="svelte-12q9p71"><!> <p>Tense belongs to verbs. It says when something happens: <em>amat</em> (present), <em>amabat</em> (imperfect), <em>amabit</em> (future).
		A noun such as <em>puella</em> has a case and a number, but no tense at all.</p> <p>So what should happen when an instructor ticks “present” under tense? A filter that only asks “is the tense present?” would throw away
		every noun, because a noun has no tense to check, and the instructor would lose words they never meant to leave out. <a href="#teams">Teams Silva and Mons</a> noticed this, and Teams Lux and Via solved it in a general way: a form passes the filter if it has
		no such property, or if its value is one of the ones chosen.</p> <p>That is why choosing “present” keeps all of your nouns and only the present-tense verbs. The <a>instructor tools</a> say
		the same thing next to the choices.</p></section> <!> <section aria-labelledby="code" class="svelte-12q9p71"><!> <p>These pieces are copied verbatim from the submissions (shared indentation removed). Each one's idea lives on in <code>engine.py</code>.</p> <!></section> <section aria-labelledby="compared" class="svelte-12q9p71"><!> <p>Each team wrote one function, <code>build_word_file</code>, on top of the same Latin library. All five were run unchanged on the same
		vocabulary, and the engine takes the best of each. Every team's final submission passed all of the automatic checks. The full notes
		are in <code>src/lib/engine/PROFILING.md</code>.</p> <ul><li><strong>Bundled vocabulary (Teams Lux, Via and Mons):</strong> shipping the vocabulary with the code means building a list makes no network requests and works offline. The engine does the same.</li> <li><strong>Cheap sorting first (Teams Lux and Via):</strong> choosing the matching vocabulary rows <em>before</em> the slow lookup was about twice as fast as looking up everything and filtering afterwards.</li> <li><strong>Part of speech (Teams Lux, Via and Mons):</strong> telling the library each word's part of speech picks the right word when several share a spelling.</li> <li><strong>Careful edge cases (every team):</strong> missing folders, blank cells, nouns having no tense and a failed lookup were each handled by at least one team. The engine adds one more: names such as <em>Asiae</em> are lowercased, because the game can only type lowercase a-z.</li></ul></section>`,1);function Y(a,o){A(o,!0);let s=R,d=Object.keys(s).sort(),h=d.reduce((e,t)=>e+s[t].length,0),g=[`Team Silva`,`Team Mons`],_={"Team Pons":`Skip a failed lookup and carry on, so one bad word never ruins a whole list.`,"Team Lux":`Filter the vocabulary rows before the slow lookup (about twice as fast), plus the label-to-category map.`,"Team Silva":`The observation that nouns have no tense, readable indented output, and a test that nothing needs the network.`,"Team Via":`The most edge cases: the vocabulary bundled and read once, flexible inputs, case-insensitive tags, creating folders, skipping blank rows.`,"Team Mons":`Chapter filtering before expansion, the nouns-keep-tense rule, and a matrix of empty-input tests.`},v=[{title:`Cheap sorting first, slow lookup last`,teams:[`Team Lux`,`Team Via`],text:`They picked the vocabulary rows by chapter and part of speech first, and only then ran the slow lookup. Asking for nouns never looks up a verb, and choosing nothing never touches the library. Measured, nouns from all 40 chapters took 0.19 s this way against 0.44 s the other way.`},{title:`Accepting input in more than one form`,teams:[`Team Via`],text:`One function accepts a part of speech as the library's own type, as its code ("V") or as a plain word ("verb"). It tries the library's type first and falls back to a lookup table, and <code>casefold()</code> makes capital letters not matter.`},{title:`Asking the data instead of typing in lists`,teams:[`Team Via`],text:`<code>available_choices()</code> reads the chapters and parts of speech out of the vocabulary file, so a menu built from it never offers something that is not there. The instructor page builds its checkboxes this way.`},{title:`A recipe of small, named steps`,teams:[`Team Lux`],text:`The main function reads like a plan: get the vocabulary, filter by chapter, filter by part of speech, get the forms. Each step is its own small function with a note on what goes in and what comes out.`},{title:`One rule in one line`,teams:[`Team Lux`],text:`The built-in <code>all()</code> checks that every condition holds. The students' test for each chosen grammar tag is <code>tag_part not in row or row[tag_part] in values</code>. In plain words: keep the form if it does not have that tag, or if its value is one of the chosen ones. That one test is the whole tag filter.`},{title:`Spotting a rule nobody wrote down`,teams:[`Team Silva`,`Team Mons`],text:`Each noticed that nouns have no tense, so choosing a tense must not throw nouns away. Teams Lux and Via handled it too, in a general way.`,see:!0},{title:`One bad item must not stop the rest`,teams:[`Team Pons`],text:`Each lookup sits in a <code>try</code>/<code>except</code> block. If one word fails, the code skips it and carries on, so one failure does not lose the whole list.`},{title:`Small safety habits`,teams:[`Team Via`],text:`Creating a missing folder before saving, and skipping vocabulary rows with an empty cell instead of crashing on them.`}];var x=me();E(`12q9p71`,e=>{f(()=>{T.title=`The students' engine - W&L Dictum`})});var N=S(y(x),4),F=w(N),z=w(F);M(z,{name:`students`,size:28});var B=S(z),V=p(B,!0);n(),O(F);var H=S(F,2),W=w(H);M(W,{name:`person`,size:28});var G=S(W),te=p(G,!0);n(),O(H);var K=S(H,2),ne=w(K);M(ne,{name:`python`,size:28}),n(2),O(K);var q=S(K,2),re=w(q);M(re,{name:`tests`,size:28}),n(2),O(q);var Y=S(q,2),he=w(Y);M(he,{name:`pass`,size:28}),n(2),O(Y),O(N);var ge=S(N,6);{let e=C(()=>[{id:`teams`,label:`The teams`},{id:`techniques`,label:`Techniques worth noticing`},{id:`nouns-tense`,label:`Why nouns keep their place when you pick a tense`},{id:`tests`,label:`Run their tests`},{id:`code`,label:`Their code`},{id:`compared`,label:`Why these approaches were chosen`}]);ee(ge,{get items(){return i(e)}})}var X=S(ge,2),_e=w(X);P(_e,{id:`teams`,children:(t,i)=>{n();var a=e(`The teams`);r(t,a)},$$slots:{default:!0}});var ve=S(_e,4);l(ve,21,()=>d,t,(a,o)=>{var d=ce(),f=w(d),h=w(f);M(h,{name:`students`,size:28});var v=S(h,1,!0);O(f);var x=S(f,2);l(x,21,()=>s[i(o)],t,(t,a,o)=>{n();var s=oe(),l=y(s,!0);l.nodeValue=o?`, `:``;var d=S(l),f=e=>{var t=ae(),n=p(t,!0);c(()=>{m(t,`href`,i(a).url),b(n,i(a).name)}),r(e,t)},h=t=>{var n=e();c(()=>b(n,i(a).name)),r(t,n)};u(d,e=>{i(a).url?e(f):e(h,-1)}),r(t,s)}),O(x);var T=S(x,2),E=w(T,!0),D=S(E),k=e=>{var t=se();r(e,t)},A=C(()=>g.includes(i(o)));u(D,e=>{i(A)&&e(k)}),O(T),O(d),c(()=>{b(v,i(o)),b(E,_[i(o)])}),r(a,d)}),O(ve),O(X);var Z=S(X,2),ye=w(Z);P(ye,{id:`techniques`,children:(t,i)=>{n();var a=e(`Techniques worth noticing`);r(t,a)},$$slots:{default:!0}});var be=S(ye,4);l(be,21,()=>v,t,(e,t)=>{var n=le(),a=w(n);U(w(a),{get teams(){return i(t).teams}}),O(a);var o=S(a,2),s=w(o),l=p(s),d=S(s,2);k(d,()=>i(t).text);var f=S(d),m=e=>{var t=se();r(e,t)};u(f,e=>{i(t).see&&e(m)}),O(o),O(n),c(()=>b(l,`${i(t).title??``}.`)),r(e,n)}),O(be),O(Z);var Q=S(Z,2),xe=w(Q);P(xe,{id:`nouns-tense`,children:(t,i)=>{n();var a=e(`Why nouns keep their place when you pick a tense`);r(t,a)},$$slots:{default:!0}});var Se=S(xe,6),Ce=S(w(Se));n(),O(Se),O(Q);var we=S(Q,2),Te=e=>{var t=de(),i=w(t);P(i,{id:`tests`,children:(e,t)=>{var i=ue(),a=y(i);M(a,{name:`tests`,size:28}),n(),r(e,i)},$$slots:{default:!0}}),J(S(i,2),{}),O(t),r(e,t)};u(we,e=>{e(Te)});var $=S(we,2),Ee=w($);P(Ee,{id:`code`,children:(e,t)=>{var i=fe(),a=y(i);M(a,{name:`code`,size:28}),n(),r(e,i)},$$slots:{default:!0}});var De=S(Ee,4);l(De,17,()=>ie,t,(e,t)=>{var a=pe(),o=w(a),s=w(o),l=w(s);{let e=C(()=>[i(t).team]);U(l,{get teams(){return i(e)}})}O(s);var u=S(s,2),d=w(u),f=p(d),m=S(d),h=S(m),g=p(h,!0);n(3),O(u),O(o);var _=S(o,2);{let e=C(()=>I(i(t).code));L(_,{get html(){return i(e)},get text(){return i(t).code},get label(){return i(t).file},get startLine(){return i(t).line},get title(){return i(t).title}})}O(a),c(()=>{b(f,`${i(t).title??``}.`),b(m,` ${i(t).why??``} It became `),b(g,i(t).engine)}),r(e,a)}),O($);var Oe=S($,2),ke=w(Oe);P(ke,{id:`compared`,children:(t,i)=>{n();var a=e(`Why these approaches were chosen`);r(t,a)},$$slots:{default:!0}}),n(4),O(Oe),c(e=>{b(V,d.length),b(te,h),m(Ce,`href`,e)},[()=>j(`/instructor`)]),r(a,x),D()}export{Y as component};
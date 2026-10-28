import{$ as e,C as t,D as n,F as r,G as i,L as a,Q as o,S as s,at as c,d as l,dt as u,h as d,j as f,lt as p,m,ot as h,pt as g,rt as _,st as v,t as y,vt as b,wt as x,x as S,yt as C}from"./6klcJOIi.js";import{t as w}from"./DdUt8j2x.js";import{n as T}from"./DYNtDZul.js";import{a as E,c as D,o as O,t as k}from"./V7uTxMlV.js";var A=`dictum:wrap`;function j(){try{return localStorage.getItem(A)===`1`}catch{return!1}}var M=v({wrap:!1,pulse:0,message:``,announcer:0});function N(){M.wrap=!M.wrap,M.pulse++,M.message=M.wrap?`Line wrapping on, in every code box`:`Line wrapping off, in every code box`;try{localStorage.setItem(A,M.wrap?`1`:`0`)}catch{}}function P(e){e.altKey&&!e.ctrlKey&&!e.metaKey&&e.code===`KeyZ`&&(e.preventDefault(),N())}var F=0,I=1;function ee(){F===0&&(M.wrap=j(),window.addEventListener(`keydown`,P)),F++;let e=I++;return M.announcer||=e,{id:e,unregister(){F--,M.announcer===e&&(M.announcer=0),F===0&&window.removeEventListener(`keydown`,P)}}}var L=a(`<span class="line svelte-1e06m8e"><span class="t svelte-1e06m8e"></span></span>`),R=a(`<div class="codeblock svelte-1e06m8e"><div class="bar svelte-1e06m8e"><span class="name svelte-1e06m8e"> </span> <span class="tools svelte-1e06m8e"><!> <!> <span class="sr svelte-1e06m8e" role="status"> </span></span></div>  <pre tabindex="0" role="group"><code class="svelte-1e06m8e"></code></pre></div>`);function z(a,v){C(v,!0);let T=y(v,`startLine`,3,1),E=g(()=>v.html.split(`
`)),D=g(()=>T()+i(E).length-1),O=g(()=>i(E).length>1?`${v.label} lines ${T()} to ${i(D)}`:`${v.label} line ${T()}`),A=u(!1),j=u(!1),P=u(0);n(()=>{let e=ee();return p(P,e.id,!0),e.unregister});let F=M.pulse;e(()=>{let e=M.pulse;if(e===F)return;F=e,p(j,!0);let t=setTimeout(()=>p(j,!1),900);return()=>clearTimeout(t)});async function I(){try{await navigator.clipboard.writeText(v.text),p(A,!0),setTimeout(()=>p(A,!1),2e3)}catch{}}var z=R(),B=_(z),V=_(B),H=c(V,!0),U=h(V,2),W=_(U);{let e=g(()=>i(j)?`tool flash`:`tool`);k(W,{get class(){return i(e)},label:`Wrap long lines`,tip:`Wrap long lines in every code box (Alt+Z)`,get"aria-pressed"(){return M.wrap},get onclick(){return N},children:(e,t)=>{w(e,{name:`wrap`,size:20})},$$slots:{default:!0}})}var G=h(W,2);{let e=g(()=>i(A)?`Copied!`:`Copy this code`);k(G,{class:`tool`,label:`Copy code`,get tip(){return i(e)},onclick:I,children:(e,t)=>{{let t=g(()=>i(A)?`pass`:`copy`);w(e,{get name(){return i(t)},size:20})}},$$slots:{default:!0}})}var K=h(G,2),q=c(K,!0);x(U),x(B);var J=h(B,2);let Y,X;var Z=_(J);s(Z,21,()=>i(E),t,(e,t)=>{var n=L(),a=_(n);S(a,()=>i(t),!0),x(a),x(n),r(e,n)}),x(Z),x(J),x(z),o(e=>{f(H,i(O)),f(q,i(A)?`Copied to clipboard`:i(P)&&M.announcer===i(P)?M.message:``),l(J,`aria-label`,`Code: ${v.title??i(O)??``}`),Y=d(J,1,`svelte-1e06m8e`,null,Y,{wrap:M.wrap}),X=m(J,``,X,{"max-height":v.maxHeight,"counter-reset":`line ${T()-1}`,"--gutter":e})},[()=>`${String(i(D)).length+2}ch`]),r(a,z),b()}var B=`"""W&L Dictum game data engine: builds a Wordle word list from Wheelock vocabulary (Wheelock's Latin, http://www.wheelockslatin.com/,
as published online by Eric Warmenhoven, https://www.warmenhoven.org/).

This is the only Python in the project. It runs in the browser (Pyodide) and is an
amalgam of the best ideas from the student submissions, written from scratch.
Comments like "# Team Via:" credit the team whose approach is used at that spot.
See engine/PROFILING.md for how the teams compared on network use, speed and durability.

Team ids ("Team Pons" ... "Team Mons") are anonymous. Who was on each team is in credits/students.csv only.

Output format, one entry per playable word, keyed "1", "2", ... (same as data/all.json):
    {"1": {"word": "aciem", "full": "acies, aciei, f", "translation": "...", "type": "<tag>"}}
\`type\` holds the form's tag text (e.g. "present active indicative 3rd person plural").
"""

import csv
import json
from pathlib import Path

from omnes_formae import PartOfSpeech, get_latin_forms

# Teams Lux, Via and Mons: the vocabulary ships with the program, so building a list needs no
# network at all, and it works offline. We chose this approach for the engine.
VOCAB_PATH = Path(__file__).with_name("vocab.csv")

PLEDGE = "On our honor, we have neither given nor received any unacknowledged or unauthorized aid on this lab."

# The friendly part-of-speech names the UI offers, and the library codes each one covers.
# Team Lux: pronouns also include PACKON (qu- pronouns); cardinal/ordinal count as numerals.
CATEGORIES = {
    "noun": {PartOfSpeech.NOUN},
    "verb": {PartOfSpeech.VERB},
    "adjective": {PartOfSpeech.ADJECTIVE},
    "adverb": {PartOfSpeech.ADVERB},
    "pronoun": {PartOfSpeech.PRONOUN, PartOfSpeech.PACKON},
    "numeral": {PartOfSpeech.NUMERAL},
    "preposition": {PartOfSpeech.PREPOSITION},
    "conjunction": {PartOfSpeech.CONJUNCTION},
    "interjection": {PartOfSpeech.INTERJECTION},
}
LABEL_ALIASES = {"cardinal": "numeral", "ordinal": "numeral"}  # Team Lux

# Tag components a teacher can filter on, and the values the library uses for each.
TAGS = {
    "case": ["nominative", "vocative", "genitive", "dative", "accusative", "ablative", "locative"],
    "number": ["singular", "plural"],
    "gender": ["masculine", "feminine", "neuter"],
    "tense": ["present", "imperfect", "future", "perfect", "pluperfect", "future perfect"],
    "voice": ["active", "passive"],
    "mood": ["indicative", "subjunctive", "imperative", "infinitive", "participle", "supine"],
    "person": ["1st person", "2nd person", "3rd person"],
    "comparison": ["positive", "comparative", "superlative"],
}

_vocab_cache = None


def honor_pledge() -> str:
    """Return the honor pledge string."""
    return PLEDGE


def load_vocab() -> list[dict]:
    """Return the vocabulary rows, reading vocab.csv only once (Team Via, Team Lux).

    Reading it once keeps big lists fast and light on memory.
    """
    global _vocab_cache
    if _vocab_cache is None:
        with VOCAB_PATH.open(newline="", encoding="utf-8-sig") as file:
            rows = csv.DictReader(file)
            # Team Via: skip rows with a missing Latin or English cell.
            _vocab_cache = [r for r in rows if r.get("Latin") and r.get("English")]
    return _vocab_cache


def available_choices() -> dict:
    """Return the chapters, part-of-speech names and tag values a user can pick (Team Via).

    The UI builds its checkboxes from this, so it never offers a choice the data lacks.
    """
    chapters = sorted({int(row["Chapter"]) for row in load_vocab()})
    return {"chapters": chapters, "parts_of_speech": list(CATEGORIES), "tags": TAGS}


def _categories_of(label: str) -> set:
    """Library part-of-speech codes for a CSV label like 'adjective, cardinal' or 'verb (3i)'."""
    parts = set()
    for word in label.split("(")[0].replace('"', "").split(","):
        word = word.strip().casefold()
        parts |= CATEGORIES.get(LABEL_ALIASES.get(word, word), set())
    return parts


def _as_part_of_speech(value) -> set:
    """Accept a PartOfSpeech, its code ("V"), or a friendly name ("verb") (Team Via)."""
    if isinstance(value, PartOfSpeech):
        return {value}
    try:
        return {PartOfSpeech(value)}
    except ValueError:
        return CATEGORIES.get(str(value).strip().casefold(), set())


def _matches_tags(form: dict, allowed: dict) -> bool:
    """True if every tag component the form HAS is one of the allowed values.

    A form without a component passes it: nouns have no tense, so a tense choice keeps
    them (Teams Silva and Mons spotted this; Teams Lux and Via generalised it to every component).
    Values are compared case-insensitively and enum-safe (Team Via).
    """
    for key, values in allowed.items():
        if key in form and str(getattr(form[key], "value", form[key])).casefold() not in values:
            return False
    return True


def build_word_file(
    file_path: str,
    chapters: list[int],
    parts_of_speech: list,
    tag_choices: dict[str, list[str]],
) -> int:
    """Save a word file of the chosen words at file_path. Return how many words were saved."""
    selected = set().union(*map(_as_part_of_speech, parts_of_speech)) if parts_of_speech else set()
    allowed = {k: {str(v).casefold() for v in vs} for k, vs in tag_choices.items()}
    chapters = {int(c) for c in chapters}
    words = {}
    seen = set()

    # Teams Lux and Via: pick the matching vocabulary rows FIRST, and do the (slow) library lookup
    # only for those. With nothing selected the library is never even touched (0 ms).
    # Team Via: a chosen verb also lets participle/supine forms through the lookup stage.
    verb_like = {PartOfSpeech.VERB, PartOfSpeech.PARTICIPLE, PartOfSpeech.SUPINE}
    for row in load_vocab() if selected else []:
        row_parts = _categories_of(row["Part of Speech"])
        if int(row["Chapter"]) not in chapters:
            continue
        if not (row_parts & selected) and not (PartOfSpeech.VERB in row_parts and selected & verb_like):
            continue

        # Teams Lux, Via and Mons: pass the whole vocab entry ("-, odisse, odi, osurum") and its
        # part of speech straight to the library. The part of speech picks the right word
        # among homographs, so the list holds only forms of words that are on the vocabulary list.
        # Teams Pons and Silva: one bad lookup must not abort the whole list.
        try:
            forms = get_latin_forms(row["Latin"], row["Part of Speech"])
        except Exception:
            continue

        for form in forms:
            # Not in any team's code: lowercase and require a-z, because the game cannot
            # type capitals ("Asiae") or accents, so keep lowercase a-z only.
            word = form["word"].strip().lower()
            if len(word) != 5 or not (word.isascii() and word.isalpha()):
                continue
            if word in seen or form["pos"] not in selected or not _matches_tags(form, allowed):
                continue
            seen.add(word)  # All five teams: first matching form wins a spelling
            words[str(len(words) + 1)] = {
                "word": word,
                "full": row["Latin"].strip(),
                "translation": row["English"].strip(),
                "type": form["tag"],
            }

    # Team Via: create missing parent folders. Teams Silva and Mons: indented JSON, readable on GitHub.
    out = Path(file_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(words, indent=4, ensure_ascii=False) + "\\n", encoding="utf-8")
    return len(words)
`,V=`engine/omnes_formae-v0.3.0.zip`,H=`whitakers-words-0.3.0`,U;function W(){return U??=G().catch(e=>(U=void 0,Promise.reject(e)))}async function G(){T.phase=`downloading`,T.loaded=0,T.network=0;try{let e=await O();T.total=Object.values(e.sizes).reduce((e,t)=>e+t,0);let t=(t,n)=>E(D(t),e.version,n,(e,t)=>{T.loaded+=e,t||(T.network+=e)}),n=D(`pyodide/pyodide.mjs`),{loadPyodide:r}=await import(n),i=new URL(`./`,n).href,a=globalThis.fetch;globalThis.fetch=(n,r)=>{let o=n instanceof Request?n.url:String(n),s=o.startsWith(i)?`pyodide/`+o.slice(i.length).split(`?`)[0]:``;return s in e.sizes?t(s,s.endsWith(`.wasm`)?`application/wasm`:void 0):a(n,r)};let o,s,c;try{[o,s,c]=await Promise.all([r({indexURL:i}),t(V).then(e=>e.arrayBuffer()),t(`engine/vocab.csv`).then(e=>e.text())])}finally{globalThis.fetch=a}T.phase=`starting`,o.unpackArchive(s,`zip`,{extractDir:`/lib`}),o.FS.mkdirTree(`/engine`),o.FS.writeFile(`/engine/engine.py`,B),o.FS.writeFile(`/engine/vocab.csv`,c),o.runPython(`import sys; sys.path[:0] = ['/lib/${H}', '/engine']`);let l=o.pyimport(`engine`);return T.phase=`ready`,{py:o,engine:l}}catch(e){throw T.phase=`error`,e}}async function K(){let{engine:e}=await W();return e.available_choices().toJs({dict_converter:Object.fromEntries})}async function q(e,t,n){let{py:r,engine:i}=await W(),a=`/out/words.json`;return{count:i.build_word_file(a,r.toPy(e),r.toPy(t),r.toPy(n)),json:r.FS.readFile(a,{encoding:`utf8`})}}var J=`Ov23liwZoP4hntsUjS51`,Y=`https://ghsk.gardella.cc/api/oauth/github/access_token`,X=`dictum-game-data`,Z=`main`,Q=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),$=(e,t)=>t.split(`
`).map(t=>t?`<span class="${e}">${Q(t)}</span>`:``).join(`
`),te=new RegExp([String.raw`(?<comment>#[^\n]*)`,String.raw`(?<string>[rbfRBF]{0,2}("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))`,String.raw`(?<defined>\b(?:def|class)\s+)(?<name>[A-Za-z_]\w*)`,String.raw`(?<keyword>\b(?:${`and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False`})\b)`,String.raw`(?<number>\b\d[\d_]*(?:\.\d+)?\b)`].join(`|`),`g`);function ne(e){let t=``,n=0;for(let r of e.matchAll(te)){t+=Q(e.slice(n,r.index));let i=r.groups;i.comment?t+=$(`tok-comment`,i.comment):i.string?t+=$(`tok-string`,r[0]):i.name?t+=`${$(`tok-keyword`,i.defined.trim())}${Q(i.defined.slice(i.defined.trimEnd().length))}${$(`tok-name`,i.name)}`:i.keyword?t+=$(`tok-keyword`,i.keyword):t+=$(`tok-number`,i.number),n=r.index+r[0].length}return t+Q(e.slice(n))}var re=/(?<key>"(?:\\.|[^"\\\n])*"(?=\s*:))|(?<string>"(?:\\.|[^"\\\n])*")|(?<number>-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(?<literal>\b(?:true|false|null)\b)/g;function ie(e){let t=``,n=0;for(let r of e.matchAll(re)){t+=Q(e.slice(n,r.index));let i=r.groups;t+=$(i.key?`tok-name`:i.string?`tok-string`:i.number?`tok-number`:`tok-keyword`,r[0]),n=r.index+r[0].length}return t+Q(e.slice(n))}export{J as a,K as c,X as i,W as l,ne as n,Y as o,Z as r,q as s,ie as t,z as u};
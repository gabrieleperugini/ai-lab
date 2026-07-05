#!/usr/bin/env python3
"""
Offline content generator for Day 1 LLM modules.

Runs a small causal language model (gpt2, fallback distilgpt2) locally and
writes static JSON files consumed by the web app. No API keys, no server:
the browser never runs the model.

Outputs:
  src/content/generated/day1/m1_next_token.json
  src/content/generated/day1/m2_context_switch.json
  src/content/generated/day1/m3_branching.json
  src/content/generated/day1/m4_sampling.json
  scripts/output/day1_generation_report.md

Usage:
  scripts/.venv/bin/python scripts/generate_day1_llm_content.py [--model gpt2]

Notes on tokenization: GPT-2 uses subword tokens; English word candidates are
encoded WITH a leading space (" Paris"). Single-token candidates get exact
next-token probabilities. Multi-token candidates get exact phrase
probabilities via the chain rule; the report flags them.
"""

import argparse
import json
import math
import re
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "content" / "generated" / "day1"
REPORT_DIR = ROOT / "scripts" / "output"

WORD_TOKEN_RE = re.compile(r"^ ?[A-Za-z][A-Za-z']*$")
BANNED_WORDS = {
    "sex", "sexual", "rape", "kill", "killed", "murder", "suicide", "nazi",
    "hitler", "porn", "naked", "drug", "drugs", "cocaine", "terrorist",
    "bomb", "gun", "shot", "shoot", "damn", "hell", "shit", "fuck", "bitch",
    "ass", "dick", "gay", "slave", "blood", "dead", "death", "die", "dies",
}


def banned(text: str) -> bool:
    words = re.findall(r"[a-z']+", text.lower())
    return any(w in BANNED_WORDS for w in words)


class LM:
    def __init__(self, name: str):
        self.name = name
        self.tok = AutoTokenizer.from_pretrained(name)
        self.model = AutoModelForCausalLM.from_pretrained(name)
        self.model.eval()

    @torch.no_grad()
    def next_token_probs(self, prompt: str) -> torch.Tensor:
        ids = self.tok(prompt, return_tensors="pt")
        logits = self.model(**ids).logits[0, -1]
        return torch.softmax(logits, dim=-1)

    @torch.no_grad()
    def phrase_logprob(self, prompt: str, continuation: str):
        """Chain-rule log P(continuation | prompt). Returns (logprob, ids)."""
        cont_ids = self.tok.encode(continuation, add_special_tokens=False)
        current = self.tok(prompt, return_tensors="pt")["input_ids"]
        total = 0.0
        for tid in cont_ids:
            logits = self.model(current).logits[0, -1]
            log_probs = torch.log_softmax(logits, dim=-1)
            total += float(log_probs[tid])
            current = torch.cat([current, torch.tensor([[tid]])], dim=1)
        return total, cont_ids

    @torch.no_grad()
    def sample(self, prompt: str, n: int, max_new: int, temperature: float,
               top_k: int, top_p: float, seed: int) -> list[str]:
        torch.manual_seed(seed)
        ids = self.tok(prompt, return_tensors="pt")
        out = self.model.generate(
            **ids,
            do_sample=True,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p,
            max_new_tokens=max_new,
            num_return_sequences=n,
            pad_token_id=self.tok.eos_token_id,
        )
        prompt_len = ids["input_ids"].shape[1]
        return [self.tok.decode(seq[prompt_len:], skip_special_tokens=True) for seq in out]

    @torch.no_grad()
    def greedy_continue(self, prompt: str, max_new: int, seed: int = 0) -> str:
        torch.manual_seed(seed)
        ids = self.tok(prompt, return_tensors="pt")
        out = self.model.generate(
            **ids,
            do_sample=True,
            temperature=0.7,
            top_k=40,
            top_p=0.95,
            max_new_tokens=max_new,
            num_return_sequences=1,
            pad_token_id=self.tok.eos_token_id,
        )
        return self.tok.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)

    def top_word_tokens(self, probs: torch.Tensor, k: int, exclude: set[str] | None = None,
                        pool: int = 300):
        """Top-k tokens that look like plain words, from the `pool` most likely."""
        exclude = {e.lower() for e in (exclude or set())}
        top = torch.topk(probs, pool)
        picks = []
        for p, tid in zip(top.values.tolist(), top.indices.tolist()):
            text = self.tok.decode([tid])
            if not WORD_TOKEN_RE.match(text):
                continue
            clean = text.strip()
            if len(clean) < 2 and clean.lower() not in {"a", "i"}:
                continue
            if banned(clean) or clean.lower() in exclude:
                continue
            picks.append({"text": text, "id": tid, "probability": p})
            if len(picks) == k:
                break
        return picks


REPORT_LINES: list[str] = []


def report(line: str = ""):
    REPORT_LINES.append(line)


# ---------------------------------------------------------------------------
# M1: next-token probability examples
# ---------------------------------------------------------------------------

M1_EXAMPLES = [
    # Familiar phrases
    ("once_upon", "Familiar phrases", "Once upon a",
     ["time", "day", "night", "place", "story"],
     "A very familiar phrase makes one continuation dominate.",
     "Even an 'obvious' answer is a probability, not a certainty."),
    ("happy_birthday", "Familiar phrases", "Happy birthday to",
     ["you", "me", "her", "him", "everyone"],
     "The song makes 'you' by far the most expected next token.",
     "Common phrases create sharp distributions."),
    ("end_of_day", "Familiar phrases", "At the end of the day,",
     ["the", "I", "it", "we", "everything"],
     "After a common idiom, many small function words are plausible.",
     "Sometimes no single token dominates."),
    ("better_late", "Familiar phrases", "Better late than",
     ["never", "sorry", "late", "early", "nothing"],
     "Proverbs are strong patterns in training text.",
     "The model has read this sentence many times."),
    # Facts and knowledge
    ("capital_france", "Facts and knowledge", "The capital of France is",
     ["Paris", "Berlin", "Rome", "London", "Madrid"],
     "The most likely continuation matches a fact about the world.",
     "Next-token prediction can require knowledge, not just grammar."),
    ("largest_planet", "Facts and knowledge", "The largest planet in the Solar System is",
     ["Jupiter", "Saturn", "Earth", "Mars", "Venus"],
     "Astronomy facts appear in the training text often enough to shape the bars.",
     "Facts become statistics over tokens."),
    ("water_freezes", "Facts and knowledge", "Water freezes at zero degrees",
     ["Celsius", "Fahrenheit", "Kelvin", "centigrade", "below"],
     "The model must pick the unit that makes the sentence true.",
     "Small models know some facts better than others."),
    ("world_cup", "Facts and knowledge", "The capital of the country that hosted the World Cup in 1998 is",
     ["Paris", "Berlin", "London", "Rome", "Madrid"],
     "Answering needs a chain: World Cup 1998 to France, France to Paris.",
     "A chain of knowledge can hide inside one blank. Small models often fail here!"),
    # Context changes meaning
    ("bank_money", "Context changes meaning", "I walked to the bank and deposited some",
     ["money", "cash", "checks", "coins", "documents"],
     "The verb 'deposited' selects the financial meaning of bank.",
     "Context words activate one meaning of an ambiguous word."),
    ("bank_river", "Context changes meaning", "The fisherman stood on the bank of the",
     ["river", "lake", "stream", "water", "sea"],
     "The fisherman puts us on a river bank, so nature words rise.",
     "Same word, different world."),
    ("bat_baseball", "Context changes meaning", "The baseball player swung the bat and hit the",
     ["ball", "pitch", "fence", "ground", "catcher"],
     "The sports frame makes 'ball' the star.",
     "A scenario is a probability magnet."),
    ("bat_cave", "Context changes meaning", "At sunset, the bat flew out of the",
     ["cave", "tree", "attic", "darkness", "shadows"],
     "'Flew' turns the bat into an animal.",
     "One verb can flip the meaning."),
    ("umbrella", "Context changes meaning", "The sky became dark and full of clouds, so I took my",
     ["umbrella", "coat", "jacket", "camera", "keys"],
     "Rain is never mentioned, yet the model expects it.",
     "Prediction often uses implied information."),
    ("restaurant", "Context changes meaning", "The waiter handed us the menu and asked what we wanted to",
     ["order", "eat", "drink", "try", "have"],
     "The restaurant scene makes 'order' and 'eat' likely.",
     "Context narrows the space of plausible tokens."),
    # Ambiguity and probability
    ("breakfast_federico", "Ambiguity and probability", "For breakfast, Federico usually eats",
     ["cereal", "eggs", "toast", "croissants", "pasta"],
     "Many answers are plausible; the name may shift expectations slightly.",
     "Probabilities reflect patterns and assumptions, not facts about Federico."),
    ("breakfast_friedrich", "Ambiguity and probability", "For breakfast, Friedrich usually eats",
     ["cereal", "eggs", "toast", "bread", "sausage"],
     "Compare with Federico: does the name change the bars?",
     "A model predicts plausible text, not personal truth."),
    ("student_test", "Ambiguity and probability", "The student opened the test and realized",
     ["that", "she", "he", "it", "what"],
     "The next token is probably a humble function word, and the probability is spread out.",
     "Tiny words control large futures. Explore this one in Branching Stories!"),
    ("library", "Ambiguity and probability", "In the library, everyone started to",
     ["whisper", "read", "study", "talk", "laugh"],
     "Social norms make quiet activities more likely, but not certain.",
     "Language models absorb social patterns from text."),
    # Reasoning-like steps
    ("algebra", "Reasoning-like steps", "A number is multiplied by 5. Then 10 is added. The result is 20. Therefore, the original number was",
     ["1", "2", "3", "4", "5"],
     "The right answer needs a small inverse calculation: (20 - 10) / 5 = 2.",
     "Small models often get this wrong; check where the mass actually goes!"),
    ("trophy", "Reasoning-like steps", "The trophy would not fit into the suitcase because it was too",
     ["big", "large", "small", "heavy", "old"],
     "The pronoun 'it' is ambiguous; world knowledge is needed to resolve it.",
     "Common sense hides inside next-token prediction."),
    ("oven", "Reasoning-like steps", "He put the ice cream in the oven and it",
     ["melted", "burned", "froze", "disappeared", "cooled"],
     "The continuation depends on knowing what heat does to ice cream.",
     "Physics shows up as language statistics."),
    ("freezer", "Reasoning-like steps", "He put the ice cream in the freezer and it",
     ["froze", "melted", "cooled", "hardened", "disappeared"],
     "A one-word change in context reverses the physical outcome.",
     "World knowledge is encoded indirectly through examples."),
    ("syllogism", "Reasoning-like steps", "All cats are mammals. Luna is a cat. Therefore, Luna is a",
     ["mammal", "cat", "dog", "planet", "person"],
     "A tiny logical inference decides the likely token.",
     "Some blanks require reasoning over the whole prompt."),
]

# Examples that should show a link into M3 Branching Stories.
M1_BRANCHING_LINKS = {"student_test", "trophy", "once_upon"}


def gen_m1(lm: LM) -> dict:
    report("## M1 next-token examples\n")
    examples = []
    for ex_id, category, prompt, candidates, explanation, takeaway in M1_EXAMPLES:
        probs = lm.next_token_probs(prompt)
        sorted_probs = torch.argsort(probs, descending=True)
        rank_of = {int(tid): i + 1 for i, tid in enumerate(sorted_probs[:5000].tolist())}
        options = []
        report(f"### {ex_id}: `{prompt}`\n")
        report("| candidate | tokens | probability | rank |")
        report("|---|---|---|---|")
        # The model's own favorite word-tokens join the display so the bars
        # reflect where the mass actually goes (and 'other' stays honest).
        model_tops = lm.top_word_tokens(probs, 4, exclude=set(candidates))
        COMMON_SHORT = {"a", "i", "an", "he", "we", "it", "is", "of", "to", "in", "on",
                        "at", "my", "me", "us", "no", "so", "or", "if", "do", "be", "the"}
        model_tops = [
            t for t in model_tops
            if t["probability"] >= 0.015
            and (len(t["text"].strip()) >= 3 or t["text"].strip().lower() in COMMON_SHORT)
        ][:2]
        display = [(c, False) for c in candidates] + [
            (t["text"].strip(), True) for t in model_tops
        ]
        for cand, from_model in display:
            spaced = " " + cand if not prompt.endswith(" ") else cand
            ids = lm.tok.encode(spaced, add_special_tokens=False)
            if len(ids) == 1:
                p = float(probs[ids[0]])
                rank = rank_of.get(ids[0])
            else:
                logp, ids = lm.phrase_logprob(prompt, spaced)
                p = math.exp(logp)
                rank = None
            tok_strs = [lm.tok.decode([i]) for i in ids]
            options.append({
                "label": cand,
                "tokenText": spaced,
                "tokenIds": ids,
                "tokenStrings": tok_strs,
                "probability": round(p, 6),
                "rank": rank,
                "multiToken": len(ids) > 1,
                "fromModel": from_model,
            })
            report(f"| {cand}{'*' if from_model else ''} | {len(ids)} ({tok_strs}) | {p:.4f} | {rank if rank else 'phrase'} |")
        options.sort(key=lambda o: -o["probability"])
        other = max(0.0, 1.0 - sum(o["probability"] for o in options))
        report(f"\nother mass: {other:.4f}\n")
        examples.append({
            "id": ex_id,
            "category": category,
            "prompt": prompt,
            "displayMode": "next-token-probabilities",
            "options": options,
            "other": round(other, 6),
            "explanation": explanation,
            "takeaway": takeaway,
            "branchingLink": ex_id in M1_BRANCHING_LINKS,
        })
    return {"model": lm.name, "examples": examples,
            "notes": "Probabilities from a small open GPT-style model; they do not represent current frontier chatbots exactly."}


# ---------------------------------------------------------------------------
# M2: context switch pairs
# ---------------------------------------------------------------------------

M2_PAIRS = [
    ("bank", "Finance or river?", "Financial bank", "River bank",
     "I walked into the bank and asked for a",
     "We had a picnic on the grassy bank of the",
     ["loan", "river", "deposit", "lake", "check"],
     "The words around 'bank' decide whether it is a building or a riverside."),
    ("bat", "Baseball or animal?", "Baseball", "Night animal",
     "The player picked up the bat and hit the",
     "At night, the bat flew out of the",
     ["ball", "cave", "window", "pitch", "darkness"],
     "The actions 'picked up and hit' versus 'flew out' select the meaning."),
    ("mouse", "Computer or animal?", "Computer", "Animal",
     "She clicked the mouse and opened the",
     "The cat chased the mouse under the",
     ["file", "table", "bed", "window", "program"],
     "Clicking selects the device; chasing selects the animal."),
    ("cold", "Illness or temperature?", "Illness", "Temperature",
     "I stayed out in the rain and now I have a bad",
     "The lake water was freezing, and my hands felt",
     ["cold", "numb", "cough", "headache", "wet"],
     "The same word can be a sickness or a sensation, depending on the sentence."),
    ("python", "Programming or animal?", "Coding class", "Zoo",
     "In the coding class, they learned Python and wrote a",
     "At the zoo, they saw a python wrapped around a",
     ["program", "tree", "branch", "script", "snake"],
     "The same word belongs to two completely different worlds."),
]


def gen_m2(lm: LM) -> dict:
    report("## M2 context pairs\n")
    pairs = []
    for pid, title, label_a, label_b, prompt_a, prompt_b, candidates, explanation in M2_PAIRS:
        sides = {}
        for side, prompt in (("a", prompt_a), ("b", prompt_b)):
            probs = lm.next_token_probs(prompt)
            opts = []
            for cand in candidates:
                spaced = " " + cand
                ids = lm.tok.encode(spaced, add_special_tokens=False)
                if len(ids) == 1:
                    p = float(probs[ids[0]])
                else:
                    logp, ids = lm.phrase_logprob(prompt, spaced)
                    p = math.exp(logp)
                opts.append({"label": cand, "probability": round(p, 6),
                             "multiToken": len(ids) > 1})
            other = max(0.0, 1.0 - sum(o["probability"] for o in opts))
            sides[side] = {"prompt": prompt, "options": opts, "other": round(other, 6)}
            report(f"### {pid} ({side}): `{prompt}`")
            for o in opts:
                report(f"- {o['label']}: {o['probability']:.4f}")
            report(f"- other: {other:.4f}\n")
        pairs.append({
            "id": pid, "title": title,
            "labelA": label_a, "labelB": label_b,
            "a": sides["a"], "b": sides["b"],
            "candidates": candidates,
            "explanation": explanation,
        })
    return {"model": lm.name, "pairs": pairs}


# ---------------------------------------------------------------------------
# M3: branching trees (3 choices deep, real probabilities at every node)
# ---------------------------------------------------------------------------

M3_ROOTS = [
    ("student_test", "The test", "The student opened the test and realized"),
    ("robot_button", "The robot", "The robot saw the red button and"),
    ("detective", "The detective", "The detective found a single clue under the"),
    ("meeting", "The meeting", "The message said the meeting was moved to"),
    ("dragon", "The dragon", "When the dragon reached the village, it"),
]

BRANCH_WIDTHS = [4, 3, 3]  # options per level


def gen_m3(lm: LM) -> dict:
    report("## M3 branching trees\n")
    trees = []
    for tid, title, root in M3_ROOTS:
        nodes = {}

        def build(node_id: str, context: str, depth: int):
            probs = lm.next_token_probs(context)
            picks = lm.top_word_tokens(probs, BRANCH_WIDTHS[depth])
            other = max(0.0, 1.0 - sum(p["probability"] for p in picks))
            options = []
            for i, pick in enumerate(picks):
                child_id = f"{node_id}_{i}"
                new_context = context + pick["text"]
                options.append({
                    "text": pick["text"],
                    "probability": round(pick["probability"], 6),
                    "next": child_id if depth + 1 < len(BRANCH_WIDTHS) else None,
                })
                if depth + 1 < len(BRANCH_WIDTHS):
                    build(child_id, new_context, depth + 1)
                else:
                    ending = None
                    for attempt in range(5):
                        raw = lm.greedy_continue(new_context, 14,
                                                 seed=(hash(child_id) + attempt * 7919) % 100000)
                        ending = clean_sample(raw)
                        if ending:
                            break
                    options[-1]["ending"] = ending or "..."
            nodes[node_id] = {"context": context, "options": options,
                              "other": round(other, 6)}

        build("root", root, 0)
        trees.append({"id": tid, "title": title, "root": root, "nodes": nodes})
        report(f"### {tid}: `{root}`")
        root_opts = nodes["root"]["options"]
        report("root options: " + ", ".join(f"{o['text']!r} {o['probability']:.3f}" for o in root_opts))
        report(f"nodes: {len(nodes)}\n")
    return {"model": lm.name, "trees": trees,
            "notes": "Options are the most likely plain-word tokens at each step; 'other' covers everything else."}


# ---------------------------------------------------------------------------
# M4: cached sampled continuations
# ---------------------------------------------------------------------------

M4_PROMPTS = [
    ("student_test", "The student opened the test and realized"),
    ("quiet_lab", "In a quiet laboratory, the machine suddenly"),
    ("pizza", "To make a perfect pizza, first"),
    ("detective", "The detective found a single clue under the"),
    ("lights_out", "When the lights went out, everyone"),
    ("recipe", "The recipe said to add sugar, but Maria added"),
    ("gravity", "A good explanation of gravity is"),
    ("robot_help", "The robot wanted to help, so it"),
    ("teacher_email", "The email from the teacher said that tomorrow"),
    ("science_fair", "At the science fair, the strangest invention was"),
]

M4_SETTINGS = [
    ("Low randomness", 0.2, 20, 0.90, 101),
    ("Medium randomness", 0.8, 50, 0.95, 202),
    ("High randomness", 1.2, 100, 0.98, 303),
]


def clean_sample(text: str) -> str | None:
    text = text.replace("\n", " ").strip()
    text = re.sub(r"\s+", " ", text)
    # cut at the first sentence end if present
    m = re.search(r"[.!?](?=\s|$)", text)
    if m:
        text = text[: m.end()]
    text = text.strip()
    if len(text.split()) < 3:
        return None
    if banned(text):
        return None
    if not all(31 < ord(c) < 0x2100 or c in "…—’‘“”" for c in text):
        return None
    return text


def gen_m4(lm: LM) -> dict:
    report("## M4 sampled continuations\n")
    prompts = []
    for pid, prompt in M4_PROMPTS:
        # first-step inspector: real top tokens for the prompt
        probs = lm.next_token_probs(prompt)
        first = lm.top_word_tokens(probs, 8)
        first_step = [{"text": t["text"], "probability": round(t["probability"], 6)} for t in first]
        first_other = max(0.0, 1.0 - sum(t["probability"] for t in first))

        sample_sets = []
        removed = 0
        for label, temp, top_k, top_p, seed in M4_SETTINGS:
            raw = lm.sample(prompt, n=20, max_new=26, temperature=temp,
                            top_k=top_k, top_p=top_p, seed=seed)
            cleaned, seen = [], set()
            for s in raw:
                c = clean_sample(s)
                if c is None or c.lower() in seen:
                    removed += 1
                    continue
                seen.add(c.lower())
                cleaned.append(c)
            sample_sets.append({
                "label": label,
                "temperature": temp, "top_k": top_k, "top_p": top_p,
                "samples": cleaned[:14],
            })
        prompts.append({
            "id": pid, "prompt": prompt,
            "firstStep": {"options": first_step, "other": round(first_other, 6)},
            "sampleSets": sample_sets,
        })
        counts = ", ".join(f"{s['label']}: {len(s['samples'])}" for s in sample_sets)
        report(f"### {pid}: `{prompt}`\n  kept {counts}; removed {removed} (dupes/short/filtered)\n")
    return {"model": lm.name, "prompts": prompts,
            "notes": "Continuations were sampled offline with the settings shown; the site replays them."}


# ---------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="gpt2")
    ap.add_argument("--only", default="", help="comma list: m1,m2,m3,m4")
    args = ap.parse_args()

    try:
        lm = LM(args.model)
    except Exception as e:  # noqa: BLE001
        print(f"failed to load {args.model} ({e}); falling back to distilgpt2")
        lm = LM("distilgpt2")

    report(f"# Day 1 generation report\n\nmodel: `{lm.name}`\n")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    only = set(args.only.split(",")) if args.only else {"m1", "m2", "m3", "m4"}

    if "m1" in only:
        (OUT_DIR / "m1_next_token.json").write_text(
            json.dumps(gen_m1(lm), indent=1, ensure_ascii=False))
        print("m1 done")
    if "m2" in only:
        (OUT_DIR / "m2_context_switch.json").write_text(
            json.dumps(gen_m2(lm), indent=1, ensure_ascii=False))
        print("m2 done")
    if "m3" in only:
        (OUT_DIR / "m3_branching.json").write_text(
            json.dumps(gen_m3(lm), indent=1, ensure_ascii=False))
        print("m3 done")
    if "m4" in only:
        (OUT_DIR / "m4_sampling.json").write_text(
            json.dumps(gen_m4(lm), indent=1, ensure_ascii=False))
        print("m4 done")

    (REPORT_DIR / "day1_generation_report.md").write_text("\n".join(REPORT_LINES))
    print(f"report written to {REPORT_DIR / 'day1_generation_report.md'}")


if __name__ == "__main__":
    main()

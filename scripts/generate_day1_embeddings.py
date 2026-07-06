#!/usr/bin/env python3
"""
Offline embedding generator for M6 Meaning Map.

Loads pretrained GloVe word vectors (gensim downloader), selects a curated
vocabulary, reduces to 3D with PCA, computes nearest neighbors and puzzle
answers from the FULL-dimensional vectors, and writes a static JSON file.

Output:
  src/content/generated/day1/m6_embeddings.json
  appends to scripts/output/day1_generation_report.md

Usage:
  scripts/.venv/bin/python scripts/generate_day1_embeddings.py
"""

import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "content" / "generated" / "day1" / "m6_embeddings.json"
REPORT = ROOT / "scripts" / "output" / "day1_generation_report.md"

# word -> (display label, category)
VOCAB: dict[str, tuple[str, str]] = {}


def add(words: str, category: str, capitalize: bool = False):
    for w in words.split(", "):
        VOCAB[w] = (w.capitalize() if capitalize else w, category)


add("king, queen, man, woman, prince, princess, royal, crown", "royalty & people")
add("paris, france, rome, italy, madrid, spain, berlin, germany, london", "places", capitalize=True)
add("pizza, pasta, sushi, burger, bread, cheese, tomato, coffee", "food & drink")
add("cat, dog, mouse, lion, tiger, horse, cow, duck, snake", "animals")
add("car, train, bicycle, airplane, bus, road, station, airport", "transport")
add("happy, sad, angry, excited, afraid, calm, tired", "emotions")
add("school, student, teacher, exam, homework, classroom, university", "school")
add("computer, keyboard, screen, code, python, java, software, internet", "technology")
add("river, bank, money, loan, water, fish, lake", "river & money")

ANALOGY_PUZZLES = [
    ("analogy_queen", "king - man + woman is closest to...?", "king", "man", "woman", "queen"),
    ("analogy_rome", "Paris - France + Italy is closest to...?", "paris", "france", "italy", "rome"),
    ("analogy_berlin", "Rome - Italy + Germany is closest to...?", "rome", "italy", "germany", "berlin"),
]

ODD_ONE_OUT = [
    ("odd_keyboard", ["cat", "dog", "horse", "keyboard"]),
    ("odd_pizza", ["paris", "rome", "berlin", "pizza"]),
    ("odd_python", ["python", "java", "code", "snake"]),
    ("odd_bank", ["money", "loan", "bank", "duck"]),
]


def main():
    import gensim.downloader as api

    print("loading glove-wiki-gigaword-100 (downloads ~130MB on first run)...")
    kv = api.load("glove-wiki-gigaword-100")

    words = [w for w in VOCAB if w in kv]
    missing = [w for w in VOCAB if w not in kv]
    vecs = np.stack([kv[w] for w in words])

    # PCA to 3D for display
    centered = vecs - vecs.mean(axis=0)
    _, _, vt = np.linalg.svd(centered, full_matrices=False)
    coords = centered @ vt[:3].T
    # scale into the app's expected range
    coords = coords / np.abs(coords).max(axis=0) * np.array([7.0, 6.5, 4.0])

    def unit(v):
        return v / np.linalg.norm(v)

    def cosine(a, b):
        return float(unit(kv[a]) @ unit(kv[b]))

    # nearest neighbors within the curated vocabulary (full-dim cosine)
    neighbors = {}
    for w in words:
        sims = sorted(((cosine(w, o), o) for o in words if o != w), reverse=True)
        neighbors[w] = [{"label": VOCAB[o][0], "similarity": round(s, 3)} for s, o in sims[:5]]

    lines = ["\n## M6 embeddings (glove-wiki-gigaword-100)\n",
             f"vocabulary: {len(words)} words; missing from GloVe: {missing or 'none'}\n"]

    # analogy puzzles, computed full-dim, restricted to curated vocab
    puzzles = []
    for pid, prompt, a, b, c, expected in ANALOGY_PUZZLES:
        target = unit(kv[a]) - unit(kv[b]) + unit(kv[c])
        exclude = {a, b, c}
        best = max((float(unit(target) @ unit(kv[o])), o) for o in words if o not in exclude)
        ok = best[1] == expected
        lines.append(f"- {prompt} -> `{best[1]}` (expected `{expected}`) {'OK' if ok else 'MISMATCH'}")
        if ok:
            puzzles.append({
                "id": pid, "kind": "analogy", "prompt": prompt,
                "a": VOCAB[a][0], "b": VOCAB[b][0], "c": VOCAB[c][0],
                "answer": VOCAB[expected][0],
                "highlight": [VOCAB[a][0], VOCAB[b][0], VOCAB[c][0]],
                "explanation": "Computed with the real word vectors: the direction between the first two words, applied to the third, lands nearest to this word."
            })

    for pid, group in ODD_ONE_OUT:
        avg = {w: np.mean([cosine(w, o) for o in group if o != w]) for w in group}
        odd = min(avg, key=avg.get)
        lines.append(f"- odd one out {group} -> `{odd}`")
        puzzles.append({
            "id": pid, "kind": "odd-one-out", "prompt": "Which word is the odd one out?",
            "options": [VOCAB[w][0] for w in group], "answer": VOCAB[odd][0],
            "highlight": [VOCAB[w][0] for w in group],
            "explanation": "The odd word has the lowest average similarity to the others in the real vector space."
        })

    puzzles.append({
        "id": "ambiguity_bank", "kind": "question",
        "prompt": "GloVe gives 'bank' ONE point. Click it, read its true neighbors, then answer: which meaning won?",
        "options": ["money and loans", "rivers and water"],
        "answer": "money and loans",
        "highlight": ["bank", "money", "loan", "river", "water", "lake", "fish"],
        "explanation": "Classic word vectors give one point per word, so the most frequent meaning dominates. This is why modern models use context-dependent embeddings."
    })
    puzzles.append({
        "id": "cluster_food", "kind": "question",
        "prompt": "One region contains pizza, pasta, sushi, burger, bread. What would you call it?",
        "options": ["food", "Italy", "restaurants", "round things"],
        "answer": "food",
        "highlight": ["pizza", "pasta", "sushi", "burger", "bread", "cheese", "tomato"],
        "explanation": "Clusters in embedding space often correspond to human categories. Nobody labeled them: they emerge from how words are used."
    })
    puzzles.append({
        "id": "surprise_neighbor", "kind": "explore",
        "prompt": "Click any word and find one neighbor that surprises you. Why might the model have put them together?",
        "answer": "",
        "explanation": "Vectors come from co-occurrence in text, which sometimes disagrees with our intuition. Surprises are discussion gold."
    })

    points = []
    for i, w in enumerate(words):
        label, category = VOCAB[w]
        points.append({
            "label": label,
            "x": round(float(coords[i, 0]), 3),
            "y": round(float(coords[i, 1]), 3),
            "z": round(float(coords[i, 2]), 3),
            "category": category,
            "neighbors": neighbors[w],
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "model": "glove-wiki-gigaword-100",
        "projection": "PCA to 3D (display only; neighbors and puzzles use full 100-dim vectors)",
        "points": points,
        "puzzles": puzzles,
    }, indent=1, ensure_ascii=False))

    with REPORT.open("a") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {OUT} with {len(points)} points and {len(puzzles)} puzzles")


if __name__ == "__main__":
    main()

# Teacher guide, Day 1: LLMs and next-token prediction

Total lab time: **150-180 min**, split into short sessions between slides.
Two classes run in parallel (about 50 students each), students work in groups
of 3-4 on laptops.

A note worth repeating in class: **the probability bars are real outputs of
two small open models**, computed offline and cached as static files:
Qwen2.5-0.5B (2024, the default) and GPT-2 small (2019). A dropdown in M1,
M2, M3, M8 and the Reasoning Demo switches between them on the same prompt.
The killer comparison: Qwen answers 'The capital of France is Paris' with
31.6% (GPT-2: 3.2%), but BOTH give Paris almost 0% on the World Cup 1998
chain. Five years of progress improved the facts, not the chained reasoning.
Neither represents ChatGPT or any frontier model exactly. M6 shows real GloVe
word embeddings; the M5 tokenizer is the real cl100k_base.

## Links to hand out

- Students, class A: `https://<user>.github.io/ai-lab/?class=A#/day1`
- Students, class B: `https://<user>.github.io/ai-lab/?class=B#/day1`
- You (projector): add `&teacher=1`. This reveals teacher notes, the timeline,
  and projector tools. Do not share this link with students.

## Suggested timeline (matches the v2 slide deck)

The Arena is not one block: its six categories are the six "Next Token
Arena" stops in the slides, each openable by QR deep link (see README,
"Deep links for the slides").

| Session | Slides | Lab | Time |
| --- | --- | --- | --- |
| A: Let's be next-token predictors | Part I + II start | Arena stops 1-4, M2 Context Lens interleaved | 35-45 min |
| B: Probability, branching, reasoning | probability, function words, reasoning | Arena 5 + M3 Branching Stories; Arena 6 + M4 Reasoning Demo | 20-25 + 15-20 min |
| C: Inside the chatbot's brain | UTF-8, tokenization, embeddings, de-embedding | M5 Tokenizer, M6 Meaning Map, M7 De-embedding Lens | 20-25 + 30-35 + 20-25 min |
| D: Putting it together | summary, repeated NTP | M8 Sampling Machine | 30-35 min |
| E: Real chatbot bridge | (none) | M9 Real Chatbot Bridge | 15-25 min |

Cut list if running late: use 1-2 rounds per Arena stop; make M7 a 10-minute
projector demo; fold M9's discussion into the wrap-up.

## Module-by-module script

### M1: Next Token Arena (30 rounds in 6 slide-matching categories)
1. Project round 1 ("Once upon a"). Groups shout their token, then reveal.
   The bars are real GPT-2 probabilities; 'other' is the rest of the vocabulary.
2. Do "capital of France" and "World Cup 1998" together. GPT-2 puts more mass
   on 'the' and 'now' than on 'Paris' in the second one: a small model cannot
   do the knowledge chain. That failure is the discussion.
3. Options labeled as added by the model show GPT-2's own favorites; they
   teach that models continue text rather than answer quizzes.
4. Categories match the slide stops: basics, context, the suitcase, world
   knowledge, probability, reasoning. Each is deep-linkable for QR codes.
5. Bridge buttons follow the slides: context/suitcase rounds open Context
   Lens, probability opens Branching Stories, reasoning opens the Reasoning
   Demo; each companion module links back to its Arena category.

### M2: Context Lens (8 pairs, real probabilities)
1. The interaction is one big flip button; the same five candidate words keep
   their bars while the context flips, so the trade is unmissable.
2. Start with bank: loan and deposit trade places with river and lake.
3. The percentages are small because GPT-2 spreads mass over 50k tokens; tell
   students to watch the RATIOS, not the absolute numbers.
4. Pairs, slide ones first: ice cream (oven/freezer), fire (water/gasoline),
   umbrella (remembered/forgot), then bank, bat, mouse, cold, python.
   Suggested question: "Which context word did the work?"
5. A trophy/suitcase pair was tried and removed: GPT-2 cannot resolve the
   Winograd pronoun, so the bars did not flip. Tell this story if asked!

### M3: Branching Stories (20 min, three steps deep, 5 stories)
1. Students choose three tokens in a row; real GPT-2 probabilities update
   after every choice, then GPT-2 writes a short ending.
2. Ask every time: "What did the first choice make impossible?"
3. The explored-futures list counts endings a group has visited; challenge
   them to find the strangest GPT-2 ending.
4. Stories: the test, the robot, the detective, the meeting, the dragon.

### M4: Reasoning Demo (15-20 min, the slides' proof as a game)
1. This is the "NTP part 5 - intelligence" proof ladder. At every step only
   one option keeps the proof alive; the options are the v1 slide options.
2. Let students crash into dead ends: the explanation of WHY each road dies
   is the mathematical content of the activity.
3. The punchline is the 🤖 toggle: GPT-2 prefers 'The' at step 1 (92%), a
   wrong expansion at step 4, and a premature QED at step 5. Ask: what is
   missing? (Look-ahead. Planning. This bridges to the slides' discussion.)
4. Suggested question: "Which dead end was the most tempting, and why?"

### M5: Tokenizer Microscope (20-25 min)
1. Reveal that the lecture simplified: token is not word. This microscope is
   the REAL GPT-4 tokenizer (cl100k_base) running in their browser.
2. 'Compare with word split' shows the human cut next to the model cut.
3. Best surprises: 'BocconiSummerSchool2026' explodes; ' bank' vs 'bank' vs
   'Bank' all differ; the emoji is several tokens; 'pizza pizza pizza' shows
   how repetition and position interact.
4. Toggle token IDs: "to the model, your sentence is literally these numbers."
5. Suggested question: why does Italian split into more pieces than English?
   (Less Italian in the training data.)

### M6: Meaning Map (30-35 min, real GloVe embeddings in 3D)
1. These are REAL word vectors (GloVe, 100 dimensions), squeezed to 3D by PCA
   for display. Neighbors and puzzle answers use the full vectors.
2. Let groups drag to rotate and scroll to zoom; then search "bank" and click
   it: its true neighbors are money and loan. One point per word means the
   frequent meaning wins; this sets up contextual embeddings.
3. The puzzle side panel has 10 puzzles: three verified analogies
   (king-man+woman = queen; Paris-France+Italy = Rome; Rome-Italy+Germany =
   Berlin), computed odd-one-outs (python/java/code vs snake is the star),
   the bank ambiguity, cluster naming, and a free 'surprising neighbor' hunt.
4. Analogy arrows: solid = the relation, dashed = the same direction reused;
   students click the landing point on the map.
5. 'Reset view' restores the camera if a group gets lost.

### M7: De-embedding Lens (20-25 min)
1. The story in three steps (also shown in the module): the model has an
   internal state, a vector; each token has a word direction; aligned
   directions get high match scores, and softmax turns scores into
   probabilities.
2. On screen the labels are student-friendly (thought vector, word directions,
   match scores); press the visible 'technical names' button for the formal ones.
3. Walk the presets: Fairy tale, Proof, River bank, Financial bank; then the
   new ones: Rainy day, Restaurant, Logic (mammal!), Computer mouse, Baseball
   bat. Each preset reproduces an earlier module's behavior.
4. Tasks are listed in the module: drag toward pizza, raise the temperature,
   find a direction where 'lions' wins.

### M8: Sampling Machine (30-35 min, 10 prompts, cached GPT-2 samples)
1. Everything shown was genuinely sampled from GPT-2 offline at the settings
   displayed; the site replays the cache, so classroom Wi-Fi does not matter.
2. Have groups generate repeatedly at LOW randomness first: the continuations
   start repeating quickly because only a few distinct ones exist. That IS
   the lesson.
3. Then HIGH randomness: hunt for the strangest continuation.
4. 'Compare the three modes' puts one sample of each side by side; 'Inspect
   first step' shows the real first-token bars (connect back to M1).
5. Suggested question: "Is creativity the same as correctness?" Mention that
   temperature and top-p are real settings in LLM APIs.

### M9: Real Chatbot Bridge (15-25 min, 17 cards)
1. Teacher-led on the projector if chatbot access is blocked or limited:
   open the card, copy the prompt, run it in a real chatbot on your machine,
   and paste the output into the projector notepad (visible in teacher mode)
   so the class can annotate it together.
2. Non-negotiable rule: groups write their PREDICTION before testing.
3. Cards are filterable by category: context, reasoning, style, hallucination,
   instruction following, token constraints, sampling, limitations.
4. Give most time to the hallucination cards: fluent is not the same as
   correct. That is the safety takeaway of the day.
5. If time allows, run the same prompt in two different chatbots. Different
   chatbots answer differently; that is part of the lesson.

## Collecting answers

Polls and reflection submissions are **currently disabled**: reflection
prompts are discussion-only and any notes students type stay on their device.
Collect answers by voice, raised hands, or your own external form. To
re-enable the poll panels and the copy-to-clipboard submission cards later,
flip `enablePolls` / `enableSubmissions` in `src/content/config.ts`.

## Fallback plans

The site is fully client-side: **once loaded, everything except M8 keeps
working offline**. Tell students not to close the tab.

- Total failure before load: one teacher laptop plus projector can run every
  module as a class activity (they were designed to be projectable).
- External chatbot access fails (blocked or down): run M8 as a prediction
  and discussion exercise, then compare against the M4 simulator instead of
  a real chatbot. The prediction step carries most of the learning.
- Polls down: use raised hands plus the reflection cards afterwards.

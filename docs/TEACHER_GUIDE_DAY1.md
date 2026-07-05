# Teacher guide, Day 1: LLMs and next-token prediction

Total lab time: **150-180 min**, split into short sessions between slides.
Two classes run in parallel (about 50 students each), students work in groups
of 3-4 on laptops.

A note repeated throughout the modules and worth repeating in class: **every
probability bar in the platform is a teaching distribution**. The numbers are
hand-designed to be plausible and instructive; they are not measured outputs
of a real model. The sampling math (M4, M7) and the tokenizer (M5) are real.

## Links to hand out

- Students, class A: `https://<user>.github.io/ai-lab/?class=A#/day1`
- Students, class B: `https://<user>.github.io/ai-lab/?class=B#/day1`
- You (projector): add `&teacher=1`. This reveals teacher notes, the timeline,
  and projector tools. Do not share this link with students.

## Suggested timeline

| Session | Slides | Lab | Time |
| --- | --- | --- | --- |
| A: What does a chatbot do? | mineral, computation, language, learning from examples | M1 Next Token Arena | 20 min |
| B: Context and probability | NTP basics, context, world knowledge, probability | M2 Context Lens, M3 Branching Stories | 20 + 20 min |
| C: From probabilities to text | repeated NTP, sampling, issues | M4 Sampling Machine | 30-35 min |
| D: Inside the chatbot's brain | tokens, embeddings, de-embedding | M5 Tokenizer, M6 Meaning Map, M7 De-embedding Lens | 20-25 + 30-35 + 20-25 min |
| E: Real chatbot bridge | (none) | M8 Real Chatbot Bridge | 15-25 min |

Cut list if running late: shorten M1 to 4 rounds; make M7 a 10-minute
projector demo; fold M8's discussion into the wrap-up.

## Module-by-module script

### M1: Next Token Arena (20 min, 26 rounds available)
1. Project round 1 ("Once upon a"). Groups shout their token, then reveal.
2. Do "capital of France" and "World Cup 1998" together; the second needs a
   knowledge chain, make that explicit.
3. Free exploration (about 10 min). Use the category filter: the slide rounds
   cover NTP parts 1-5; the new rounds add common sense, social context,
   procedures, ambiguity (bat!), instruction following, and style.
4. Suggested questions: "Where do these probabilities come from?" "Which round
   needed knowledge no grammar book contains?"
5. Expected observations: obvious answers are still probabilistic; some blanks
   need knowledge or computation; 'lions' never quite dies.

### M2: Context Lens (20 min, 9 pairs)
1. The interaction is one big flip button. Start with the bank pair (echoes
   the slides), flip back and forth twice before revealing the changed words.
2. Push on the umbrella pair: nothing says "rain", yet "wet" wins. The model
   uses implied information.
3. New pairs to explore: bat (cave/baseball), mouse (kitchen/computer), apple
   (lunch/technology), cold (drink/illness), light (weight/brightness).
4. Suggested question: "Which single word did the most work?"

### M3: Branching Stories (20 min, now two-step)
1. Students now choose the FIRST token, see new probabilities, choose the
   SECOND token, and reach an ending. Demo one full path ('that', then 'she').
2. Ask every time: "What did the first choice make impossible?"
3. The explored-futures list at the bottom counts how many endings a group
   has visited; challenge them to reach them all.
4. The proof example frames reasoning as a ladder of commitments.

### M4: Sampling Machine (30-35 min, 10 prompt families)
1. Explain the two knobs ONCE on the projector: temperature reshapes the bars,
   top-k cuts the tail. The math is real.
2. 'Generate 3 versions' shows three complete runs side by side; it is the
   fastest way to see variety (or the lack of it at top-k = 1).
3. Challenge sequence: (a) boring machine, T=0.2 and top-k=1: every run is
   identical; (b) chaotic machine, T=2.0 and all tokens; (c) find the sweet spot.
4. Suggested question: "Is creativity the same as correctness?" Mention that
   temperature is a real setting in LLM APIs.

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

### M6: Meaning Map (30-35 min, now in 3D)
1. Say it plainly: this is a hand-made teaching map; real embeddings have
   hundreds of dimensions. The geometry idea is the real thing, and rotating
   in 3D shows why more dimensions give meanings more room.
2. Let groups drag to rotate for a minute; then search "bank": two points.
   Same for "mouse". Bridge back to Context Lens.
3. Category toggles isolate clusters; the floating card shows nearest
   neighbors with distances.
4. The four puzzles are buttons above the map. Answers: princess, Paris,
   bank (river), pasta. The analogy puzzles draw the relation arrow solid and
   the reused direction dashed; students click the landing point.
5. If a group gets lost in the rotation, 'Reset view' restores the start.

### M7: De-embedding Lens (20-25 min)
1. The story in three steps (also shown in the module): the model has an
   internal state, a vector; each token has a word direction; aligned
   directions get high match scores, and softmax turns scores into
   probabilities.
2. On screen the labels are student-friendly (thought vector, word directions,
   match scores); hover the info title for the technical names.
3. Walk the presets: Fairy tale, Proof, River bank, Financial bank; then the
   new ones: Rainy day, Restaurant, Logic (mammal!), Computer mouse, Baseball
   bat. Each preset reproduces an earlier module's behavior.
4. Tasks are listed in the module: drag toward pizza, raise the temperature,
   find a direction where 'lions' wins.

### M8: Real Chatbot Bridge (15-25 min, 17 cards)
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

- Configure poll links per module in `src/content/day1-llm/modules.ts`
  (see CONTENT_EDITING.md). Separate URLs for class A and B. Every module
  ships with a suggested poll question.
- Without polls: groups press **Copy reflection**; a formatted card (class,
  group, module, result, reflection) lands in their clipboard; they paste it
  into a Google Form, Teams/chat, or email.

## Fallback plans

The site is fully client-side: **once loaded, everything except M8 keeps
working offline**. Tell students not to close the tab.

- Total failure before load: one teacher laptop plus projector can run every
  module as a class activity (they were designed to be projectable).
- External chatbot access fails (blocked or down): run M8 as a prediction
  and discussion exercise, then compare against the M4 simulator instead of
  a real chatbot. The prediction step carries most of the learning.
- Polls down: use raised hands plus the reflection cards afterwards.

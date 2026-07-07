import type { LabModule, TimelineSession } from "../../lib/types";

/**
 * Day 1 module metadata. Poll URLs are empty by default: paste your Slido /
 * Mentimeter / Google Forms links into `poll.classAUrl` / `poll.classBUrl`
 * and the poll panel will appear automatically. Missing URLs show a clean
 * placeholder; removing the whole `poll` field hides the panel.
 */

export const day1Modules: LabModule[] = [
  {
    id: "next-token-arena",
    dayId: "day1",
    title: "Next Token Arena",
    subtitle: "Be the model",
    durationMin: 20,
    level: "intro",
    mission:
      "For a few minutes, you are the chatbot. Given the text so far, choose the next token. Then compare your intuition with a model-like probability distribution.",
    studentInstructions: [
      "Read the prompt out loud in your group.",
      "Each of you picks the token you think comes next.",
      "Agree on one group answer and click it.",
      "Press 'Reveal probabilities' and compare with your intuition.",
      "Use the category filter; the six categories follow the lecture: basics, context, the suitcase, world knowledge, probability, reasoning."
    ],
    component: "NextTokenArena",
    reflectionQuestions: [
      "Which example surprised you the most, and why?",
      "Where did the small model put its probability somewhere you did not expect?"
    ],
    noticePoints: [
      "Sometimes one token is almost certain; sometimes many are plausible.",
      "The bars are REAL probabilities from a small open model (Qwen2.5 by default; switch to GPT-2 to compare), computed offline.",
      "'other' is all the rest of the vocabulary; a model can prefer tokens nobody offered.",
      "Small models fail some knowledge and reasoning rounds; that failure is part of the lesson."
    ],
    takeaway:
      "Predicting the next token is a probabilistic task. Behind one blank there can be grammar, knowledge, context, or reasoning.",
    underTheHood:
      "The percentages are real next-token probabilities, precomputed offline from GPT-2 (124M parameters) and Qwen2.5-0.5B: each model's softmax distribution over its vocabulary, with multi-token words scored by the chain rule and 'other' holding the remaining probability mass. Nothing is computed live.",
    teacherNotes: [
      "Run the first two rounds as a full-class warm-up before letting groups continue.",
      "Ask groups to shout their token before revealing; it makes the distribution feel earned.",
      "Probabilities are real model outputs. The dropdown compares Qwen2.5-0.5B (2024) and GPT-2 (2019). Killer demo: Qwen gets Paris at 31.6% on the capital of France (GPT-2: 3.2%), yet BOTH give Paris almost 0% on the World Cup chain.",
      "Options added by the model show where it actually puts its mass (often 'the' or 'now'): models continue text, they do not answer quizzes.",
      "Timing: about 2 min per round; 30 rounds in 6 categories matching the slide stops (Arena 1-6). Categories can be deep-linked from the slides: #/day1/next-token-arena/basics, /context, /suitcase, /world-knowledge, /probability, /reasoning.",
      "Bridge buttons follow the slides: context and suitcase rounds open Context Lens, probability opens Branching Stories, reasoning opens the Reasoning Demo."
    ],
    poll: {
      question: "Which next token did your group choose?"
    }
  },
  {
    id: "context-lens",
    dayId: "day1",
    title: "Context Lens",
    subtitle: "Same words, different worlds",
    durationMin: 20,
    level: "core",
    mission: "Flip the context. Watch the probabilities move.",
    studentInstructions: [
      "Read the sentence and its probability bars.",
      "Press the big flip button: the context changes, the word stays.",
      "Watch which bars grow and which collapse.",
      "Pick another pair from the selector and repeat.",
      "Discuss: which context word did the work?"
    ],
    component: "ContextLens",
    reflectionQuestions: [
      "Which word changed the most, and why?",
      "In the umbrella example, the sentence never says it rained. How does the model still 'know'?"
    ],
    noticePoints: [
      "The sentence is almost the same, but the world it describes has changed.",
      "The SAME candidate words get very different probabilities in the two contexts.",
      "These are real model probabilities, computed offline; small numbers are normal, the flip is the point. Try both models with the dropdown."
    ],
    takeaway: "Same word, different context, different next-token distribution.",
    underTheHood:
      "Same offline pipeline as the Arena: for each context we store the model's true next-token distribution, so flipping the context swaps in the distribution the real model produced for the other prompt.",
    teacherNotes: [
      "Start with the bank pair; loan and deposit trade places with river and lake.",
      "The percentages look small because the model spreads mass over 50k tokens; focus on the RATIOS between the two contexts.",
      "Pairs: bank, bat, mouse, cold, python. Python (program vs snake) lands well with students.",
      "Ask: where did the model learn this? (From patterns in text, not from a dictionary.)"
    ],
    poll: {
      question: "Which context word changed the prediction most?"
    }
  },
  {
    id: "branching-stories",
    dayId: "day1",
    title: "Branching Stories",
    subtitle: "One token commits the future",
    durationMin: 20,
    level: "core",
    mission:
      "Build a continuation three tokens deep. After each choice, new real probabilities appear. What did your first choice make impossible?",
    studentInstructions: [
      "Read the starting sentence.",
      "Choose a token: it gets appended, and the probabilities update.",
      "Choose two more times; then read the ending the model wrote.",
      "Press 'Restart this branch' and take a different first token.",
      "Try all five stories. How early does the future get locked in?"
    ],
    component: "BranchingStories",
    reflectionQuestions: [
      "What did your first token choice make impossible?",
      "Did the probabilities get sharper or flatter as the sentence grew?"
    ],
    noticePoints: [
      "Each token commits the text to a branch; the next distribution depends on the path so far.",
      "The percentages are real model probabilities recomputed at every step; the dropdown switches model (and resets the path).",
      "The grey 'other' chip is everything we did not display; the model could go there too."
    ],
    takeaway:
      "Generation is a sequence of commitments. Small early choices can force very different futures.",
    underTheHood:
      "Each branch shows the model's real conditional distribution given everything chosen so far: the whole story tree was precomputed offline with GPT-2 / Qwen2.5-0.5B, one next-token query per node.",
    teacherNotes: [
      "Demo one full path on the projector, then free exploration.",
      "Five stories: the test, the robot, the detective, the meeting, the dragon.",
      "The endings after the third choice were also written by the models (sampled offline); some are charmingly weird.",
      "Discussion: why can't the model go back once a token is emitted? Compare with how students write essays."
    ],
    poll: {
      question: "Which first token created the most interesting branch?"
    }
  },
  {
    id: "reasoning-demo",
    dayId: "day1",
    title: "Reasoning Demo",
    subtitle: "A proof, one committed token at a time",
    durationMin: 15,
    level: "challenge",
    mission:
      "Walk the odd-square proof from the slides. At every step only one token keeps the proof alive; every other road is a dead end.",
    studentInstructions: [
      "Read the statement: the square of an odd number is odd.",
      "Choose the next step of the proof from the options.",
      "Hit a dead end? Read why the road dies, then start again.",
      "Reach QED, then toggle the model's picks and compare Qwen2.5 with GPT-2.",
      "Ask yourselves: what would happen to a model that cannot look ahead?"
    ],
    component: "ReasoningDemo",
    reflectionQuestions: [
      "Which dead end was the most tempting, and why?",
      "GPT-2 crashes at step 1; Qwen2.5 survives to the last step. What changed in five years, and what is still missing?"
    ],
    noticePoints: [
      "The options at each step come from the lecture slides; only one keeps the proof alive.",
      "A proof is a chain of commitments: one wrong token and the future is ruined.",
      "The models' preferences (chain-rule scores) differ: GPT-2 (2019) picks a dead end almost immediately, Qwen2.5 (2024) walks nearly the whole proof."
    ],
    takeaway:
      "To produce structured reasoning by next-token prediction, the probabilities must encode planning: the model has to prefer tokens whose future works out.",
    underTheHood:
      "Each candidate continuation is scored by its real chain-rule log-probability under the model (the product of its tokens' probabilities), then the shown options are softmax-normalized against each other. Precomputed offline.",
    teacherNotes: [
      "This is the slides' 'NTP part 5 - intelligence' proof, turned into a game.",
      "Let students crash into dead ends; the restart is the lesson, not a punishment.",
      "The 🤖 toggle is the punchline, now in two acts: GPT-2 picks 'The' at step 1 (92%) and premature QEDs; Qwen2.5 makes the RIGHT choice at steps 1-5 (96-98%!) and only stumbles on the final QED. Progress is visible, planning is still fragile.",
      "Bridge to the slides' discussion: probabilities must encode a form of look-ahead for reasoning to work.",
      "Fast groups: ask them to design their own 4-option step where only one road survives."
    ]
  },
  {
    id: "tokenizer-microscope",
    dayId: "day1",
    title: "Tokenizer Microscope",
    subtitle: "Words are not tokens",
    durationMin: 25,
    level: "core",
    mission: "Type text and see what the model actually reads.",
    studentInstructions: [
      "Type any sentence in the box, or press a preset.",
      "Each colored chip is one token: what the model actually reads.",
      "Turn on 'Compare with word split' to see how humans would cut the sentence.",
      "Work through the checklist: leading spaces, capitals, made-up words, repetitions, Italian."
    ],
    component: "TokenizerMicroscope",
    reflectionQuestions: [
      "Which preset had more tokens than you expected?",
      "What happens to made-up words? And to emojis?"
    ],
    noticePoints: [
      "In the slides we pretended TOKEN = WORD. Real chatbots usually use smaller pieces.",
      "Spaces and capitalization change the tokens.",
      "Rare or made-up words get split into many small pieces; common words are one token."
    ],
    takeaway:
      "A chatbot does not see text exactly like we do. Before prediction, text is chopped into tokens.",
    underTheHood:
      "This module runs GPT-2's actual byte-pair-encoding tokenizer live in your browser, with the same ~50k-token vocabulary the real model uses (that download is why this module loads slowly).",
    teacherNotes: [
      "This module uses the REAL GPT-4 tokenizer (cl100k_base), bundled in the page; it is not a toy.",
      "Nice reveals: 'BocconiSummerSchool2026' explodes into pieces; ' bank' vs 'bank' differ; the emoji is several tokens.",
      "Italian is usually split into more tokens than English; ask why (less Italian in the training data).",
      "Token IDs can be toggled on: each chip is literally a number to the model."
    ],
    poll: {
      question: "Which preset had the most surprising tokenization?"
    }
  },
  {
    id: "meaning-map",
    dayId: "day1",
    wide: true,
    title: "Meaning Map",
    subtitle: "Embeddings as geometry",
    durationMin: 35,
    level: "core",
    mission: "Explore a 3D map of real word embeddings. Find neighbors, clusters, and surprises.",
    studentInstructions: [
      "Every point is a word. Close points have related meanings.",
      "Drag to rotate, scroll to zoom, click a point for its true nearest neighbors.",
      "Search for 'bank'. Which meaning won, money or river?",
      "Toggle categories to isolate the clusters.",
      "Work through the puzzles in the side panel: analogies, odd-one-out, and more."
    ],
    component: "MeaningMap",
    reflectionQuestions: [
      "Which neighbor surprised you the most? Why might the model have put them together?",
      "Why does 'bank' get only ONE point here, and why is that a problem?"
    ],
    noticePoints: [
      "These are REAL word vectors (GloVe), reduced to 3D just for display.",
      "Neighbors and puzzle answers are computed from the full 100-dimensional vectors.",
      "king - man + woman really lands closest to queen: relationships become directions.",
      "Classic embeddings give one point per word, so 'bank' must pick one meaning. Modern models fix this with context."
    ],
    takeaway:
      "Inside a model, words can be represented by numbers. Similar meanings become nearby points, and language becomes geometry.",
    underTheHood:
      "Real 100-dimensional GloVe word vectors, learned from word co-occurrence statistics on large text corpora, projected to 3D with PCA for display. Neighbors and analogies are computed in the full 100 dimensions, not in the projection.",
    teacherNotes: [
      "The vectors are real (GloVe, trained on Wikipedia+news). PCA squeezes 100 dimensions into 3, so on-screen distances are approximate; neighbor lists use the true vectors.",
      "The analogy puzzles were verified against the real vectors: king-man+woman = queen, Paris-France+Italy = Rome, Rome-Italy+Germany = Berlin.",
      "The 'bank' ambiguity puzzle sets up tomorrow's contextual embeddings story.",
      "Odd-one-out answers are computed, not hand-picked: snake loses to python/java/code!",
      "If rotation confuses a group, press 'Reset view'."
    ],
    poll: {
      question: "Which neighbor or cluster surprised you most?"
    }
  },
  {
    id: "deembedding-lens",
    dayId: "day1",
    wide: true,
    title: "De-embedding Lens",
    subtitle: "From the model's thought to next-token scores",
    durationMin: 25,
    level: "challenge",
    mission: "Move the model's thought vector and watch which words become likely.",
    studentInstructions: [
      "Pick a preset: the arrow becomes the model's thought after that prompt.",
      "Drag the arrow tip; words pointing the same way score higher.",
      "Task: choose 'Fairy tale'. Which token wins?",
      "Task: choose 'River bank'. Why do 'ducks' become likely?",
      "Task: drag the thought toward 'pizza'. What happens?",
      "Task: increase temperature. Do low-score tokens get more chance?"
    ],
    component: "DeembeddingLens",
    reflectionQuestions: [
      "Point the arrow between two clusters. What happens to the bars?",
      "Why does making the arrow longer sharpen the probabilities?"
    ],
    noticePoints: [
      "1. The model has an internal state, a vector.",
      "2. Each possible next token also has an output vector, a word direction.",
      "3. Tokens pointing in a similar direction get higher match scores; softmax turns scores into probabilities.",
      "This is a toy de-embedding model. It is not a real chatbot, but it shows the idea."
    ],
    takeaway:
      "At the end of a step, the model has an internal state. De-embedding turns that state into scores for possible next tokens. The highest-scoring token is not always the one we sample.",
    underTheHood:
      "A hand-made 2D miniature of the real mechanism: each token has a fixed 2D vector, the score is the dot product with the hidden state you drag, and a live softmax turns scores into probabilities. Real models do exactly this with thousands of dimensions.",
    teacherNotes: [
      "This is the lighthouse metaphor: the thought vector shines toward some words and leaves others dark.",
      "Real models do exactly this at every step, but in thousands of dimensions with about 100k output tokens.",
      "Connect the presets to earlier modules: 'River bank' lights up 'ducks' (Context Lens), 'Logic' lights up 'mammal' (Arena), 'Baseball bat' lights up 'field' (new pairs).",
      "Student-friendly names are used on screen: thought vector, word directions, match scores. Technical names are in the tooltip.",
      "Challenge question: can they find a direction where 'lions' wins?"
    ],
    poll: {
      question: "Which preset made the clearest de-embedding behavior?"
    }
  },
  {
    id: "sampling-machine",
    dayId: "day1",
    title: "Sampling Machine",
    subtitle: "Temperature and randomness",
    durationMin: 35,
    level: "core",
    mission:
      "Generate several continuations from the same starting sentence. Make the model boring, balanced, and chaotic.",
    studentInstructions: [
      "Pick a starting prompt (there are ten).",
      "Press 'Generate another continuation' several times at medium randomness.",
      "Switch to LOW randomness: how quickly do continuations repeat?",
      "Switch to HIGH randomness: how strange can it get?",
      "Press 'Compare the three modes' to see them side by side.",
      "Open 'Inspect first step' to see the real token probabilities underneath."
    ],
    component: "SamplingMachine",
    reflectionQuestions: [
      "What happened at low randomness? And at high randomness?",
      "Which setting made the most reliable text? Which the most interesting?",
      "Is creativity the same as correctness?"
    ],
    noticePoints: [
      "The model does not always pick the most likely token; it samples.",
      "Low randomness: safer, more repetitive. Medium: varied but coherent. High: surprising, sometimes nonsense.",
      "Every continuation here was really sampled from GPT-2 at the settings shown, offline; the site replays the cache."
    ],
    takeaway:
      "The model does not always pick the most likely next token. Sampling controls how predictable or surprising the continuation becomes.",
    underTheHood:
      "The continuations were sampled offline from the real models at different temperatures; temperature rescales the log-probabilities before the softmax, so low T sharpens the same underlying distribution and high T flattens it.",
    teacherNotes: [
      "All continuations are genuine GPT-2 samples generated offline (temperature/top-k/top-p as displayed). Nothing is generated live in class.",
      "At low randomness the cache holds only a handful of distinct continuations; repeats ARE the lesson.",
      "Race idea: which group finds the strangest high-randomness continuation?",
      "'Inspect first step' shows the model's real first-token distribution; connect it back to M1.",
      "Connect to real chatbots: temperature and top-p are real settings in LLM APIs."
    ],
    poll: {
      question: "Which temperature produced the best continuation?"
    }
  },
  {
    id: "real-chatbot-bridge",
    dayId: "day1",
    title: "Real Chatbot Bridge",
    subtitle: "Back to the real creature",
    durationMin: 20,
    level: "challenge",
    mission: "Now that you understand the mechanism, test a real chatbot and compare.",
    studentInstructions: [
      "Filter the cards by category: context, reasoning, style, hallucination, and more.",
      "Pick a card and read it in your group.",
      "FIRST write down your prediction: what will the chatbot do?",
      "Copy the prompt and try it in a real chatbot (or watch the teacher run it).",
      "Compare: what did the real chatbot do that our simulator did not?"
    ],
    component: "ChatbotBridge",
    reflectionQuestions: [
      "What did the real chatbot do that our simulator could not?",
      "Did anything in its answer look like next-token prediction at work?"
    ],
    noticePoints: [
      "Real chatbots use the same ingredients you just played with: tokens, context, probabilities, sampling, vectors.",
      "Plausible text is not the same as true text.",
      "Different chatbots may answer differently. That is part of the lesson."
    ],
    takeaway:
      "Our simulator is not a real chatbot, but it exposes mechanisms that real chatbots use: tokens, context, probabilities, sampling, vectors, and next-token repetition.",
    underTheHood:
      "No model runs here: this is a guided comparison. The mechanisms you touched all day (tokenization, context-conditioned probabilities, sampling, embeddings) are the same ones production chatbots use, scaled from 124M to hundreds of billions of parameters and trained on far more text.",
    teacherNotes: [
      "Run this teacher-led on the projector if student access to chatbots is limited or blocked.",
      "The hallucination cards are the key ones: fluency without truth. Give them time.",
      "The projector notepad below the cards lets you paste chatbot outputs so the class can annotate them together.",
      "Try the same prompt in two different chatbots if time allows; the differences are instructive.",
      "If Wi-Fi fails entirely: use the prediction step as a discussion, then compare with the simulator modules."
    ],
    poll: {
      question: "What did the real chatbot do that the simulator did not?"
    }
  },
];

export const day1Timeline: TimelineSession[] = [
  {
    title: "Session A: Let's be next-token predictors (slides Part II)",
    items: [
      "Slides: chatbots, mineral matter, computation, language, learning from examples",
      "Arena stop 1 (basics), stop 2 (context) + M2 Context Lens, stop 3 (the suitcase), stop 4 (world knowledge): 35-45 min total, interleaved with the slides"
    ]
  },
  {
    title: "Session B: Probability, branching, reasoning",
    items: [
      "Slides: probability, humble function words, reasoning",
      "Arena stop 5 (probability) + M3 Branching Stories: 20-25 min",
      "Arena stop 6 (reasoning) + M4 Reasoning Demo: 15-20 min"
    ]
  },
  {
    title: "Session C: Inside the chatbot's brain (slides Part III)",
    items: [
      "Slides: UTF-8, tokenization, embeddings, de-embedding",
      "M5 Tokenizer Microscope: 20-25 min",
      "M6 Meaning Map: 30-35 min",
      "M7 De-embedding Lens: 20-25 min"
    ]
  },
  {
    title: "Session D: Putting it together, generation",
    items: [
      "Slides: summary, repeated next-token prediction",
      "M8 Sampling Machine: 30-35 min"
    ]
  },
  {
    title: "Session E: Real chatbot bridge",
    items: ["M9 Real Chatbot Bridge: 15-25 min"]
  }
];

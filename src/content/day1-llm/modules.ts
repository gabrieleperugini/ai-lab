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
      "Use the category filter to explore: context, world knowledge, reasoning, style."
    ],
    component: "NextTokenArena",
    reflectionQuestions: [
      "Which example surprised you the most, and why?",
      "Which examples needed knowledge about the world, not just grammar?"
    ],
    noticePoints: [
      "Sometimes one token is almost certain; sometimes many are plausible.",
      "Some prompts need knowledge (Paris), some need reasoning (the algebra one).",
      "The bars are teaching distributions: hand-made, model-like probabilities, not measured outputs of a real model."
    ],
    takeaway:
      "Predicting the next token is a probabilistic task. Behind one blank there can be grammar, knowledge, context, or reasoning.",
    teacherNotes: [
      "Run the first two rounds as a full-class warm-up before letting groups continue.",
      "Ask groups to shout their token before revealing; it makes the distribution feel earned.",
      "The 'lions' option is a running gag: it gets a small but nonzero probability everywhere.",
      "Timing: about 2 min per round; 26 rounds available, 6 to 8 are enough. Use the category filter to pick themes.",
      "Link back to slides: the first rounds mirror NTP parts 1 to 5 (basics, context, world knowledge, probability, reasoning). Later rounds are new; same concepts."
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
      "Press the big flip button: only a few context words change.",
      "Watch which bars grow and which collapse.",
      "Press 'Reveal the changed words' to check your guess.",
      "Pick another pair from the selector and repeat."
    ],
    component: "ContextLens",
    reflectionQuestions: [
      "Which word changed the most, and why?",
      "In the umbrella example, the sentence never says it rained. How does the model still 'know'?"
    ],
    noticePoints: [
      "The sentence is almost the same, but the world it describes has changed.",
      "One changed word can flip the whole distribution.",
      "The model uses implied information, not just what is written."
    ],
    takeaway: "Small context changes can cause large probability changes.",
    teacherNotes: [
      "Start with the bank pair; it echoes the slides directly.",
      "Push on the umbrella pair: nothing says 'rain', yet 'wet' wins. Good discussion about implicit knowledge.",
      "New pairs beyond the slides: bat, mouse, apple, cold, light. All are ambiguity flips.",
      "Ask: where did the model learn that gasoline feeds fire? (From patterns in text, not from experiments.)"
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
      "Build a continuation one token at a time. After each choice, new probabilities appear. What did your first choice make impossible?",
    studentInstructions: [
      "Read the starting sentence.",
      "Choose the first token; it gets appended to the story.",
      "New probabilities appear: choose the second token.",
      "Read the ending you reached, then press 'Try another branch'.",
      "Explore at least three different paths. Then try the proof example."
    ],
    component: "BranchingStories",
    reflectionQuestions: [
      "What did your first token choice make impossible?",
      "In the proof, which token felt forced? Which felt free?"
    ],
    noticePoints: [
      "Generation happens one token at a time; each token is appended and becomes context.",
      "Small function words ('that', 'what', 'for') control large branches.",
      "A proof is a ladder: each step narrows what can come next."
    ],
    takeaway:
      "Generation is a sequence of commitments. Small early choices can force very different futures.",
    teacherNotes: [
      "Demo one full path on the projector ('that', then 'she'), then free exploration.",
      "The explored-paths list at the bottom shows how many futures the class has visited.",
      "The proof example previews 'reasoning as repeated next-token prediction'.",
      "Discussion: why can't the model go back once a token is emitted? Compare with how students write essays."
    ],
    poll: {
      question: "Which first token created the most interesting branch?"
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
      "Press 'One token' a few times and watch tokens get sampled from the bars.",
      "Press 'Generate 3 versions' to compare three complete continuations.",
      "Now make it BORING: temperature 0.2, top-k = 1. Generate again.",
      "Now make it CHAOTIC: temperature 2.0, all tokens. Generate again.",
      "Find the settings that give the most interesting but still sensible text."
    ],
    component: "SamplingMachine",
    reflectionQuestions: [
      "What happened at low temperature? And at high temperature?",
      "Which setting made the most reliable text? Which the most interesting?",
      "Is creativity the same as correctness?"
    ],
    noticePoints: [
      "The model does not always pick the most likely token; it samples.",
      "Low temperature: safer, more repetitive. Medium: varied but coherent. High: surprising, sometimes nonsense.",
      "Top-k = 1 always chooses the most likely token, so every run is identical."
    ],
    takeaway:
      "Generation is not just choosing the best word. It is repeated probabilistic sampling, and the sampling rule changes the personality of the output.",
    teacherNotes: [
      "The temperature math is real: p^(1/T), renormalize, then top-k cut. Only the token tree is hand-made.",
      "Race idea: which group gets the weirdest complete sentence at T=2.0?",
      "At top-k = 1 every run is identical; let students discover this themselves.",
      "'Generate 3 versions' is the fastest way to show variety at a given setting.",
      "Connect to real chatbots: 'temperature' is a real setting in LLM APIs."
    ],
    poll: {
      question: "Which temperature produced the best continuation?"
    }
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
    title: "Meaning Map",
    subtitle: "Embeddings as geometry",
    durationMin: 35,
    level: "core",
    mission: "Explore a 3D map of meaning. Find neighbors, clusters, and strange mistakes.",
    studentInstructions: [
      "Every point is a word. Close points have related meanings.",
      "Drag the map to rotate it in 3D. Click a point to see its nearest neighbors.",
      "Search for 'bank'. Why does it appear twice?",
      "Toggle categories on and off to isolate the clusters.",
      "Open the puzzles and solve all four. Click your answer on the map."
    ],
    component: "MeaningMap",
    reflectionQuestions: [
      "Which cluster surprised you? Which point seems misplaced?",
      "Why does the map need two points for 'bank' and two for 'mouse'?"
    ],
    noticePoints: [
      "Similar meanings sit close together: geometry is doing the work of meaning.",
      "Ambiguous words like 'bank' and 'mouse' need two points; context picks one.",
      "Analogies become directions: the same displacement encodes the same relationship."
    ],
    takeaway:
      "Inside a model, words can be represented by numbers. Similar meanings become nearby points, and language becomes geometry.",
    teacherNotes: [
      "This is a hand-made teaching map, NOT real embeddings; say it explicitly. Real ones live in hundreds of dimensions.",
      "The two 'bank' points bridge back to the Context Lens module; 'mouse' is the new twin example.",
      "Rotating in 3D makes the point physically: more dimensions give meanings more room to organize.",
      "Puzzle answers: princess, Paris, bank (river), pasta. The analogy arrows draw the relation direction on the map.",
      "If rotation confuses a group, press 'Reset view'; the starting angle shows all clusters."
    ],
    poll: {
      question: "Which neighbor or cluster surprised you most?"
    }
  },
  {
    id: "deembedding-lens",
    dayId: "day1",
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
  }
];

export const day1Timeline: TimelineSession[] = [
  {
    title: "Session A: What does a chatbot do?",
    items: [
      "Slides: chatbots, mineral matter, computation, language, learning from examples",
      "M1 Next Token Arena: 20 min"
    ]
  },
  {
    title: "Session B: Context and probability",
    items: [
      "Slides: NTP basics, context, world knowledge, probability",
      "M2 Context Lens: 20 min",
      "M3 Branching Stories: 20 min"
    ]
  },
  {
    title: "Session C: From probabilities to generated text",
    items: [
      "Slides: repeated next-token prediction, probability distribution, issues",
      "M4 Sampling Machine: 30-35 min"
    ]
  },
  {
    title: "Session D: Inside the chatbot's brain",
    items: [
      "Slides: tokens, embeddings, internal vectors, de-embedding",
      "M5 Tokenizer Microscope: 20-25 min",
      "M6 Meaning Map: 30-35 min",
      "M7 De-embedding Lens: 20-25 min"
    ]
  },
  {
    title: "Session E: Real chatbot bridge",
    items: ["M8 Real Chatbot Bridge: 15-25 min"]
  }
];

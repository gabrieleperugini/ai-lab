import type { LabModule, TimelineSession } from "../../lib/types";

/**
 * Day 1 module metadata. Poll URLs are empty by default: paste your Slido /
 * Mentimeter / Google Forms links into `poll.classAUrl` / `poll.classBUrl`
 * and the QR/poll panel will appear automatically.
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
      "Try the next example — the categories get sneakier."
    ],
    component: "NextTokenArena",
    reflectionQuestions: [
      "Which example surprised you the most, and why?",
      "Which examples needed knowledge about the world, not just grammar?"
    ],
    noticePoints: [
      "Sometimes one token is almost certain; sometimes many are plausible.",
      "Some prompts need knowledge (Paris), some need reasoning (the algebra one).",
      "The bars are teaching distributions: hand-made, model-like probabilities."
    ],
    takeaway:
      "Predicting the next token is a probabilistic task. Behind one blank there can be grammar, knowledge, context, or reasoning.",
    teacherNotes: [
      "Run the first two rounds as a full-class warm-up before letting groups continue.",
      "Ask groups to shout their token before revealing — it makes the distribution feel earned.",
      "The 'lions' option is a running gag: it gets a small but nonzero probability everywhere.",
      "Timing: ~2 min per round; 12 rounds available, 6-8 are enough.",
      "Link back to slides: rounds mirror the NTP parts 1-5 (basics → context → world knowledge → probability → reasoning)."
    ],
    poll: {
      question: "Which token did your group choose?"
    }
  },
  {
    id: "context-lens",
    dayId: "day1",
    title: "Context Lens",
    subtitle: "Same words, different worlds",
    durationMin: 20,
    level: "core",
    mission: "Find the words that changed the model's expectations.",
    studentInstructions: [
      "Look at the two sentences side by side. They differ by only a word or two.",
      "Use the toggle to flip between the two worlds.",
      "Watch how the probability bars move.",
      "Find the exact word that caused the change — it is highlighted when you reveal."
    ],
    component: "ContextLens",
    reflectionQuestions: [
      "Which word changed the most, and why?",
      "In the umbrella example, the sentence never says it rained. How does the model still 'know'?"
    ],
    noticePoints: [
      "One changed word can flip the whole distribution.",
      "The model uses implied information, not just what is written.",
      "Physics, causes, and consequences show up as patterns in language."
    ],
    takeaway: "Small context changes can cause large probability changes.",
    teacherNotes: [
      "Start with the bank pair — it echoes the slides directly.",
      "Push on the umbrella pair: nothing says 'rain', yet 'wet' wins. Good discussion about implicit knowledge.",
      "Ask: where did the model learn that gasoline feeds fire? (From patterns in text, not from experiments.)"
    ],
    poll: {
      question: "Which pair had the most dramatic probability flip?"
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
      "Choose the next token and watch the story branch. Then ask: what did your choice make impossible?",
    studentInstructions: [
      "Read the starting sentence.",
      "Click one of the candidate tokens to commit to it.",
      "Watch the story continue along your branch.",
      "Reset and try a different token. How different is the future?",
      "Then try the proof example: reasoning is also a chain of commitments."
    ],
    component: "BranchingStories",
    reflectionQuestions: [
      "What did your first token choice make impossible?",
      "In the proof, which token felt 'forced'? Which felt free?"
    ],
    noticePoints: [
      "Generation happens one token at a time; each token is appended and becomes context.",
      "Small function words ('that', 'what', 'for') control large branches.",
      "A proof is a ladder: each step narrows what can come next."
    ],
    takeaway:
      "Generation is a sequence of commitments. Small early choices can force very different futures.",
    teacherNotes: [
      "Demo 'that' vs 'what' on the projector, then free exploration.",
      "The proof example is visually a ladder — use it to preview 'reasoning as repeated NTP'.",
      "Discussion: why can't the model 'go back' once a token is emitted? Compare with how students write essays."
    ]
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
      "Pick a starting prompt.",
      "Press 'One token' a few times and watch tokens get sampled from the bars.",
      "Then press 'Finish the sentence' to run until punctuation.",
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
      "The model does not always pick the most likely token — it samples.",
      "Temperature reshapes the bars before sampling; top-k cuts the tail.",
      "The same prompt gives different texts every run: that's sampling, not memory."
    ],
    takeaway:
      "Generation is not just choosing the best word. It is repeated probabilistic sampling, and the sampling rule changes the personality of the output.",
    teacherNotes: [
      "The temperature math is real: p^(1/T), renormalize, then top-k cut. Only the token tree is hand-made.",
      "Race idea: which group gets the weirdest complete sentence at T=2.0?",
      "At top-k = 1 every run is identical — let students discover this themselves.",
      "Connect to real chatbots: 'temperature' is a real setting in LLM APIs."
    ],
    poll: {
      question: "Best temperature for storytelling: low, medium, or high?"
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
      "Type any sentence in the box — or press a preset.",
      "Each colored chip is one token: what the model actually reads.",
      "Compare two texts side by side and check the token counts.",
      "Work through the checklist: capitals, spaces, emojis, Italian, made-up words."
    ],
    component: "TokenizerMicroscope",
    reflectionQuestions: [
      "Which sentence had more tokens than you expected?",
      "What happens to made-up words? And to emojis?"
    ],
    noticePoints: [
      "In the lecture we pretended token = word. Real models chop text into smaller pieces.",
      "Spaces and capitalization change the tokens.",
      "Rare or made-up words get split into many small pieces; common words are one token."
    ],
    takeaway:
      "A chatbot does not see text exactly like we do. Before prediction, text is chopped into tokens.",
    teacherNotes: [
      "This module uses the REAL GPT-4 tokenizer (cl100k_base), bundled in the page — not a toy.",
      "Nice reveals: 'BocconiSummerSchool2026' explodes into pieces; ' Hello' vs 'Hello' differ; the emoji is several tokens.",
      "Italian is usually split into more tokens than English — ask why (less Italian in training data).",
      "Token IDs can be toggled on: each chip is literally a number to the model."
    ]
  },
  {
    id: "meaning-map",
    dayId: "day1",
    title: "Meaning Map",
    subtitle: "Embeddings as geometry",
    durationMin: 35,
    level: "core",
    mission: "Explore a map of meaning. Find neighbors, clusters, and strange mistakes.",
    studentInstructions: [
      "Every point is a word. Close points have related meanings.",
      "Hover or tap a point to see its nearest neighbors.",
      "Search for 'bank'. Why does it appear twice?",
      "Toggle categories on and off to see the clusters.",
      "Try the analogy puzzle: king is to queen as prince is to ...?",
      "Decide as a group: where would YOU place 'gelato'? Click the map to drop it there."
    ],
    component: "MeaningMap",
    reflectionQuestions: [
      "Which cluster surprised you? Which point seems misplaced?",
      "Where did your group place 'gelato', and why?"
    ],
    noticePoints: [
      "Similar meanings sit close together: geometry is doing the work of meaning.",
      "Ambiguous words like 'bank' need two points — context picks one.",
      "Analogies become arrows: the same displacement encodes the same relationship."
    ],
    takeaway:
      "Inside a model, words can be represented by numbers. Similar meanings become nearby points — language becomes geometry.",
    teacherNotes: [
      "This is a hand-made teaching map, NOT real embeddings — say it explicitly. Real ones live in hundreds of dimensions.",
      "The two 'bank' points bridge back to the Context Lens module.",
      "The analogy mini-game previews word-vector arithmetic (king - man + woman ≈ queen).",
      "The 'add your own word' feature is a great 5-minute group debate: placement forces them to argue about meaning."
    ],
    poll: {
      question: "Where does 'gelato' belong: food cluster, Italy cluster, or in between?"
    }
  },
  {
    id: "deembedding-lens",
    dayId: "day1",
    title: "De-embedding Lens",
    subtitle: "From hidden state to next-token scores",
    durationMin: 25,
    level: "challenge",
    mission: "Move the model's hidden thought and watch which words become likely.",
    studentInstructions: [
      "The blue arrow is the model's internal 'thought' after reading a prompt.",
      "Drag the tip of the arrow around the plane.",
      "Words aligned with the arrow score high — watch the bars react.",
      "Press the presets: each one is the thought after a different prompt.",
      "Lower and raise the temperature to sharpen or soften the scores."
    ],
    component: "DeembeddingLens",
    reflectionQuestions: [
      "Point the arrow between two clusters. What happens to the bars?",
      "Why does making the arrow longer sharpen the probabilities?"
    ],
    noticePoints: [
      "The hidden state is just a vector — an arrow in meaning space.",
      "Each output word has its own vector; the score is how aligned they are (dot product).",
      "Scores become probabilities with softmax; temperature reshapes them — same rule as the Sampling Machine."
    ],
    takeaway:
      "At the end of a step, the model has an internal state. De-embedding turns that state into scores for possible next tokens. The highest-scoring token is not always the one we sample.",
    teacherNotes: [
      "This is the 'lighthouse' metaphor: the hidden state shines toward some words and leaves others dark.",
      "Real models do exactly this at every step, but in thousands of dimensions with ~100k output tokens.",
      "Connect the presets to earlier modules: 'River bank' preset lights up 'ducks' — same story as Context Lens.",
      "Challenge question: can they find a direction where 'lions' wins?"
    ]
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
      "Pick a challenge card and read it in your group.",
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
      "If chatbot sites are blocked, this module works teacher-led on the projector."
    ],
    takeaway:
      "Our simulator is not a real chatbot, but it exposes mechanisms that real chatbots use: tokens, context, probabilities, sampling, vectors, and next-token repetition.",
    teacherNotes: [
      "Run this teacher-led on the projector if student access to chatbots is limited or blocked.",
      "The 'plausible-not-true' card is the key one: fluency without truth. Give it time.",
      "The projector notepad below the cards lets you paste chatbot outputs so the class can annotate them together.",
      "If Wi-Fi fails entirely: use the prediction step as a discussion, then compare with the simulator modules."
    ]
  }
];

export const day1Timeline: TimelineSession[] = [
  {
    title: "Session A — What does a chatbot do?",
    items: [
      "Slides: chatbots, mineral matter, computation, language, learning from examples",
      "M1 Next Token Arena: 20 min"
    ]
  },
  {
    title: "Session B — Context and probability",
    items: [
      "Slides: NTP basics, context, world knowledge, probability",
      "M2 Context Lens: 20 min",
      "M3 Branching Stories: 20 min"
    ]
  },
  {
    title: "Session C — From probabilities to generated text",
    items: [
      "Slides: repeated next-token prediction, probability distribution, issues",
      "M4 Sampling Machine: 30-35 min"
    ]
  },
  {
    title: "Session D — Inside the chatbot's brain",
    items: [
      "Slides: tokens, embeddings, internal vectors, de-embedding",
      "M5 Tokenizer Microscope: 20-25 min",
      "M6 Meaning Map: 30-35 min",
      "M7 De-embedding Lens: 20-25 min"
    ]
  },
  {
    title: "Session E — Real chatbot bridge",
    items: ["M8 Real Chatbot Bridge: 15-25 min"]
  }
];

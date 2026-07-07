import type { LabModule } from "../../lib/types";

/**
 * Learning Machines section (currently shown as "Day 2").
 * Semantic ids everywhere so day numbering can be dropped later.
 *
 * Module order tells the story: parameters -> loss -> slope/gradient ->
 * gradient descent -> generalization -> neural nets -> failures.
 *
 * Data Detective and Feature Detector Lab are TEMPORARILY HIDDEN
 * (hidden: true, entries at the bottom of this list). Their code, routes,
 * and content are intact; remove the flag to restore them.
 */

export const learningMachinesModules: LabModule[] = [
  {
    id: "what-computer-sees",
    dayId: "learning-machines",
    title: "What does the computer see?",
    subtitle: "Meanings for you, numbers for the machine",
    durationMin: 15,
    level: "intro",
    mission:
      "Look at the same image twice: once with your eyes, once as the grid of numbers the computer actually receives.",
    studentInstructions: [
      "Pick an example: a digit, a face, an icon, or a sound.",
      "Lower the resolution. When do YOU stop recognizing it?",
      "Turn on the numbers. That table is all the computer gets.",
      "Flatten it into a vector and count the inputs."
    ],
    component: "WhatComputerSees",
    reflectionQuestions: [
      "What seems easier: writing rules for all pixels, or learning from many examples? Why?"
    ],
    noticePoints: [
      "You see a meaningful object; the computer sees many numbers.",
      "A rule like 'a 3 has two bumps' is easy to say and very hard to write in terms of pixels.",
      "Every input, images or sound, becomes a list of numbers before any learning starts."
    ],
    takeaway:
      "A machine learning model receives numbers, not meanings. Learning starts when we use examples to discover patterns in those numbers.",
    underTheHood:
      "No model here: the images and the waveform are hand-made arrays of numbers, downsampled live. The point is the input format: every image or sound becomes a vector of numbers before any learning starts.",
    teacherNotes: [
      "Fits right after the classical-algorithms slides, before introducing parameters. 10 to 15 minutes.",
      "Push on challenge 2: let a group actually try to state a pixel rule for the 3, watch it collapse.",
      "The waveform example makes the same point for speech.",
      "Common confusion: students think the computer 'sees the picture somewhere'. It does not; the numbers are the picture.",
      "Discussion question: how many rules would you need for every possible handwriting style?"
    ]
  },
  {
    id: "fit-the-line",
    dayId: "learning-machines",
    title: "Fit the line",
    subtitle: "Your first trainable model: two knobs",
    durationMin: 20,
    level: "core",
    mission: "Find the line that makes the smallest mistakes.",
    studentInstructions: [
      "Move the slope and intercept sliders and watch the red error segments.",
      "Get the loss as low as you can by hand.",
      "Press 'Let the computer find it' and compare.",
      "Try the outlier trap and the curved dataset."
    ],
    component: "FitTheLine",
    reflectionQuestions: [
      "What did the two outliers do to your best line?",
      "On the curved data, why can no line ever win?"
    ],
    noticePoints: [
      "A line is a model with two parameters: slope and intercept.",
      "The loss is a score for how wrong the model is. Lower is better.",
      "Choosing the model family matters: a line cannot bend."
    ],
    takeaway:
      "Training means changing parameters until the model makes smaller errors on the examples.",
    underTheHood:
      "Model: y = m·x + b. Loss: MSE, the mean of (y − prediction)² over ~20 seeded synthetic points. 'Let the computer find it' is the exact least-squares solution, computed in closed form with no iteration.",
    teacherNotes: [
      "This is the parameters-and-loss anchor for everything that follows. 15 to 20 minutes.",
      "Make students fit by hand FIRST, so the computer's instant answer feels meaningful.",
      "The outlier trap previews robustness; the curved dataset previews model families and LM6.",
      "Common confusion: loss of 0 is usually impossible with noise; best-possible loss is shown for calibration.",
      "Discussion question: who chose what 'wrong' means? (We did, by picking squared error.)"
    ]
  },
  {
    id: "one-d-neural-nets",
    dayId: "learning-machines",
    title: "One-Dimensional Neural Nets",
    subtitle: "One neuron is simple. Five parameters are already hard to tune by hand.",
    durationMin: 25,
    level: "core",
    mission:
      "Fit real data points using sigmoid neurons: first one knob, then five. How long before you want the machine to take over?",
    studentInstructions: [
      "Activity 1: slide the threshold b until the soft step fits the blue data points.",
      "Watch the lower plot: it is this model's whole loss landscape, and the orange dot is you.",
      "Activity 2: the data forms a bump. Tune the five knobs by hand from a random start.",
      "Turn on 'show the two hidden neurons' to see the trick: two steps make a bump.",
      "Only after your best hand attempt, reveal the optimizer and let it refine YOUR settings."
    ],
    component: "OneDNeuralNets",
    reflectionQuestions: [
      "Why can one neuron never make a bump, no matter how you set b?",
      "Tuning five knobs was already hard. What about a million?"
    ],
    noticePoints: [
      "A neuron is just a parameterized function; a sigmoid neuron makes a soft step.",
      "Two hidden neurons plus an output neuron can combine two steps into a bump.",
      "The data is noisy, so the loss has a floor: even the best model keeps some error.",
      "With five parameters, hand-tuning is already painful. Training is the automatic search for good parameters."
    ],
    takeaway:
      "Five parameters already create a space that is hard to search by hand. Optimization becomes necessary very quickly, and that is exactly what training does.",
    underTheHood:
      "Model: one neuron is σ(x − b) with σ(z) = 1/(1+e⁻ᶻ); the network is σ(w1·σ(x−b1) + w2·σ(x−b2) − b3). Loss: MSE against the data points, whose y (0 or 1) is sampled from a hidden probability curve, so the loss floor is nonzero (about 0.08 and 0.10 here). The optimizer is gradient descent with finite-difference gradients (η = 3, up to 450 steps).",
    teacherNotes: [
      "Placed right after Fit the Line: same fit-the-data story with a new model family. 20 to 25 minutes.",
      "Activity 1's lower plot is the section's FIRST loss landscape (one knob, one axis); the loss landscape module scales the same picture to two knobs.",
      "The optimizer is deliberately hidden behind a reveal button: let students struggle with the five knobs first, the frustration is the lesson.",
      "The hidden-neuron overlay shows the construction: one step up, one step down, weighted and thresholded.",
      "The flat start is a symmetric saddle: both hidden neurons stay identical, so the optimizer stalls. Real training breaks symmetry with random initialization.",
      "Common confusion: the loss floor is not zero (about 0.08 and 0.10 here). The y values are noisy 0/1 samples, so even the best curve keeps errors: that IS the lesson about noise."
    ],
    wide: true
  },
  {
    id: "loss-landscape",
    dayId: "learning-machines",
    title: "The loss landscape",
    subtitle: "Every point on this map is a model",
    durationMin: 20,
    level: "core",
    mission:
      "Walk through parameter space: drag the dot, watch the line change, and find the valley where the loss is smallest.",
    studentInstructions: [
      "Drag the blue dot on the colored map.",
      "Green regions are good models, orange regions are bad ones.",
      "Watch the line on the left change as you move.",
      "Find the valley in as few drags as you can.",
      "Switch datasets and see how the valley moves.",
      "End with Two hills: a bump model on two-hill data gives TWO valleys. Find both."
    ],
    component: "LossLandscape",
    reflectionQuestions: [
      "What does one single point on the map represent?",
      "Why does the valley move when the data changes?"
    ],
    noticePoints: [
      "Slope and intercept form a 2D parameter space; the color is the loss.",
      "One dot on the map = one complete model on the left.",
      "The landscape's shape comes from the data AND the model family: on Two hills the map has a deep valley and a shallow one.",
      "Training is a search on this landscape. Real networks have millions of dimensions, same idea."
    ],
    takeaway:
      "Learning is an optimization problem. The model moves through parameter space looking for lower loss.",
    underTheHood:
      "The map is the MSE evaluated on a 48×48 grid of (m, b) pairs; colors are banded loss levels (square-root scaled so valleys get more resolution). Line datasets use y = m·x + b (always one valley: least squares is convex). Two hills uses y = m·exp(-(x-b)²/2σ²), a movable bump, which is what creates the second valley.",
    teacherNotes: [
      "The key conceptual jump of the day: from 'moving a line' to 'moving through parameter space'. 15 to 20 minutes.",
      "Ask: where is the line y = 2x - 1 on this map? (One exact point.)",
      "The outlier dataset visibly drags the valley: the data shapes the landscape.",
      "Two hills switches the model family to a movable bump (height m, center b): the deep valley fits the tall hill, the shallow valley is a TRUE local minimum on the short hill. This is the first non-convex landscape students meet; the race module exploits it next.",
      "Common confusion: students mix up data space (left) and parameter space (right). Keep naming them.",
      "Discussion question: what would this map look like with three parameters? A million?"
    ],
    wide: true
  },
  {
    id: "gradient-explorer",
    dayId: "learning-machines",
    title: "Gradient Explorer",
    subtitle: "A slope tells us which way to move",
    durationMin: 20,
    level: "core",
    mission:
      "Use local slope information to move downhill: first with a tangent line on a curve, then with a gradient arrow on a 2D map.",
    studentInstructions: [
      "Drag the orange point along the curve and watch the tangent line tilt.",
      "Read the slope. Which way is downhill when the slope is positive?",
      "Press 'One descent step' a few times. Where does the point settle?",
      "Switch to the 2D map: the red arrow (gradient) points uphill, descent goes against it.",
      "Try the 3D surface view: the orange tangent plane tilts with the gradient.",
      "Play with the learning rate: land smoothly, then cause an overshoot."
    ],
    component: "GradientExplorer",
    reflectionQuestions: [
      "The slope only describes the function near the current point. Why is that enough to learn?",
      "What happens with a learning rate that is too large?"
    ],
    noticePoints: [
      "The derivative is the slope of the tangent line; its sign says which way is downhill.",
      "In 2D the gradient is a vector of two slopes; it points uphill and descent moves against it.",
      "The slope is local information: the model never sees the whole map, and it does not need to."
    ],
    takeaway:
      "The gradient is a local guide, not a magic map. Gradient descent follows it downhill one step at a time, and the learning rate decides how far each step goes.",
    underTheHood:
      "The landscapes are fixed closed-form functions (a tanh ridge plus rational dips), not fitted models. Slopes and gradients are numerical central differences, (f(x+ε) − f(x−ε))/2ε with ε = 0.001, and a descent step is x ← x − η·slope. The 3D view is the same function drawn as a height surface with its tangent plane.",
    teacherNotes: [
      "Place between the loss landscape and the gradient descent race: this is WHERE the descent direction comes from. 15 to 20 minutes.",
      "The 1D tangent is the blackboard definition of derivative made draggable; no limits notation needed.",
      "On the 2D map, emphasize: red arrow uphill, blue arrow downhill, arrow length = steepness.",
      "The overshoot challenge previews the learning-rate lesson of the race module.",
      "The 3D surface view shows the tangent plane tilting with the gradient; use it after the flat map, not instead of it.",
      "Common confusion: the gradient points uphill, not downhill; descent NEGATES it."
    ],
    wide: true
  },
  {
    id: "gradient-descent-race",
    dayId: "learning-machines",
    title: "Gradient descent race",
    subtitle: "Let the model roll downhill by itself",
    durationMin: 25,
    level: "core",
    mission:
      "Train the model automatically: roll downhill step by step, and tune the learning rate so it gets to the valley fast without exploding.",
    studentInstructions: [
      "Pick a start (or drag one on the map) and press 'Step once' a few times.",
      "Press 'Run' and watch the line learn, the dot roll, and the loss fall.",
      "Try the 'Too small' preset. How patient are you?",
      "Try 'Too large' and 'Extreme'. What happens to the loss curve?",
      "Race: reach the target loss in as few steps as possible.",
      "Finish with Two hills: start from the 😈 start and watch the ball settle in the WRONG valley."
    ],
    component: "GradientDescentRace",
    reflectionQuestions: [
      "Why does a too-large learning rate make the loss bounce instead of fall?",
      "What information does the model use to decide the direction of each step?"
    ],
    noticePoints: [
      "Gradient descent repeatedly moves the parameters a little bit downhill.",
      "The learning rate controls the step size. Too small is slow. Too large can jump past the valley.",
      "On a landscape with several valleys, the starting point decides where descent ends: it can settle in a local minimum.",
      "Nobody tells the model the answer; the slope of the landscape is enough."
    ],
    takeaway:
      "Gradient descent is simple but sensitive. A step that is too small wastes time. A step that is too large can miss the valley.",
    underTheHood:
      "Gradient descent on the same two-parameter MSE landscapes as the previous module, with EXACT analytic gradients (closed forms exist for both the line and the bump model). Each dataset has its own honest target loss, slightly above the best reachable value. Every trajectory is genuinely computed, not scripted.",
    teacherNotes: [
      "Suggested timing: 20 to 30 minutes. Students should see that gradient descent is iterative and sensitive to the learning rate.",
      "Ask them to intentionally make it fail, then rescue it with a smaller step size.",
      "The trajectory dots fade from old to new; bouncing across the valley is clearly visible at high learning rates.",
      "Common confusion: 'the computer knows where the valley is'. It only ever feels the local slope.",
      "Two hills is the local-minimum finale: the 😈 start rolls into the shallow valley and STAYS there (loss stalls near 0.84 while the star sits at 0.21). Ask: did the algorithm fail? No: it did exactly what it promises. Escaping needs a different start, a lucky big step, or (in real training) stochastic noise.",
      "Discussion question: why do we not just try every point on the map? (Two knobs: maybe. A million knobs: never.)"
    ],
    wide: true
  },
  {
    id: "generalization",
    dayId: "learning-machines",
    title: "Generalization challenge",
    subtitle: "Memorizing is not learning",
    durationMin: 20,
    level: "core",
    mission:
      "Win on data the model has never seen. Perfect training accuracy is not the goal, new data is.",
    studentInstructions: [
      "The model only sees the filled training points; hollow points are the exam.",
      "Raise the complexity until the curve passes through every training point.",
      "Now look at the test loss. Who is winning?",
      "Find the complexity with the lowest TEST loss.",
      "Try the 'Few examples' preset and cause an overfitting disaster."
    ],
    component: "Generalization",
    reflectionQuestions: ["Why is the lowest training loss not always the best choice?"],
    noticePoints: [
      "Training loss and test loss can disagree, and the gap is the warning sign.",
      "A very flexible model can memorize noise instead of learning the pattern.",
      "More training data usually allows more complexity."
    ],
    takeaway:
      "A model that memorizes the training examples may fail on new data. Good learning means generalizing.",
    underTheHood:
      "Model family: polynomials of degree k, fit by exact least squares (on a Chebyshev basis for numerical stability). Data: a fixed smooth curve plus seeded Gaussian noise, split into training and test points. Train and test losses are both plain MSE.",
    teacherNotes: [
      "The train/test distinction from the slides made tangible. 15 to 25 minutes.",
      "The wiggly degree-12 curve through 8 points is the money shot; let every group produce it.",
      "Then show the fix: more data or less complexity.",
      "Common confusion: 'test loss is bad because the model did not see those points' - exactly, that is the point of the exam.",
      "Discussion question: what is the equivalent of memorizing for a student preparing an exam?"
    ]
  },
  {
    id: "neural-network-playground",
    dayId: "learning-machines",
    title: "Neural network playground",
    subtitle: "The boss fight: build a network, train it, break it",
    durationMin: 35,
    level: "challenge",
    mission:
      "Build a small neural network, train it live, and find the smallest one that solves each pattern, including the spiral.",
    studentInstructions: [
      "Start with 'Two groups' and ZERO hidden layers. Train. Enough?",
      "Switch to XOR. Watch the straight boundary fail, then add a hidden layer.",
      "Try the circle and the two moons.",
      "Boss fight: the spiral. Find the smallest network with high TEST accuracy.",
      "Try the 'danger' learning rate and watch training explode."
    ],
    component: "NNPlayground",
    reflectionQuestions: [
      "Why does XOR need a hidden layer?",
      "On the noisy spiral, how do you know if the network is memorizing?"
    ],
    noticePoints: [
      "A neural network is built from simple units; hidden layers combine simple boundaries into complex shapes.",
      "The parameter count is shown live: these are the weights and biases from the slides.",
      "Training is the same gradient descent as before, just in a space with many more dimensions."
    ],
    takeaway:
      "A neural network is a flexible function with many parameters. Training changes those parameters to reduce loss. Architecture, data, and learning rate all change what the model can learn.",
    underTheHood:
      "A real multilayer perceptron written in plain TypeScript: tanh (or ReLU) hidden units, sigmoid output, cross-entropy loss, trained live in your browser by backpropagation and mini-batch gradient descent on seeded 2D datasets. Nothing is precomputed or faked.",
    teacherNotes: [
      "The finale: 30 to 40 minutes, mostly free exploration around the challenge cards.",
      "Force the zero-hidden-layers start: seeing one boundary fail on XOR is the whole lesson of hidden layers.",
      "Spiral usually needs 2 to 3 hidden layers of 6 to 8 tanh neurons and some patience; that IS the discussion about architecture.",
      "The noisy spiral connects back to generalization: watch the train/test gap.",
      "Common confusion: more neurons is not always better; show the parameter count and talk about cost.",
      "Discussion question: this network has ~100 parameters. GPT-2 has 124 million. Same principles."
    ],
    wide: true
  },
  {
    id: "fool-the-network",
    dayId: "learning-machines",
    wide: true,
    title: "Fool the Network",
    subtitle: "Does it really understand?",
    durationMin: 20,
    level: "challenge",
    mission: "The model recognizes digits pretty well. Can you fool it with the smallest possible change?",
    studentInstructions: [
      "Pick a starting digit; the model's opinion updates live as you click pixels.",
      "Watch the whole probability list: confidence shifts before the answer flips.",
      "Flip the prediction with at most 4 pixel edits, then repair it again.",
      "Stress test: shift in all four directions, add noise, thicken, cover half.",
      "Which perturbations does the model survive? Which break it instantly?"
    ],
    component: "FoolTheNetwork",
    reflectionQuestions: [
      "What was the smallest change that fooled the model? Did the changed image still look like the original digit to you?",
      "The model survived some perturbations and failed on others. Can you guess why?"
    ],
    noticePoints: [
      "Accuracy on familiar examples does not guarantee robustness on unusual ones.",
      "Confidence changes gradually: watch it slide before the prediction flips.",
      "The model resists perturbations it has 'seen' (shifted, thick digits) and breaks on ones it has not.",
      "The model has no 'none of the above': it always picks some digit."
    ],
    takeaway:
      "The model is not seeing the digit the way we do. It reacts to the numerical pattern it learned: accurate on familiar examples, sometimes fragile on unusual ones. Testing failures is part of understanding a model.",
    underTheHood:
      "The 'network' is 10 fixed detectors (strokes, corners, loops), each firing on the inked fraction of its zone. A digit is scored by the distance between its activation pattern and stored prototypes (the clean, shifted, and thick variants of each digit), turned into probabilities by a softmax. No training: the prototypes play the role of training data, which is why the model resists exactly those perturbations.",
    teacherNotes: [
      "The fun finale of the section; also the bridge to real adversarial examples and model testing. 15 to 20 minutes.",
      "The classifier matches against clean, shifted, and thickened prototypes of each digit, so shift-right and thicken are RESISTED, while shift-left, occlusion, and noise can flip it. Ask students to find this asymmetry: it mirrors 'the model is robust to what it saw in training'.",
      "Ambiguous pairs to exploit: 3/8 (close the loops) and 4/9 (close the top).",
      "Discussion: did the model and humans disagree? Was the image still recognizable to us?",
      "Discussion: what does this tell us about testing models before trusting them?",
      "Do not over-explain adversarial attacks; the pixel game carries the idea."
    ]
  },

  /* ------------------------------------------------------------------
   * Temporarily hidden modules (hidden: true). Fully functional: direct
   * routes still work and teacher mode lists them. To restore a module
   * to the student view, delete its `hidden: true` line.
   * ------------------------------------------------------------------ */
  {
    hidden: true,
    id: "data-detective",
    dayId: "learning-machines",
    title: "Data Detective",
    subtitle: "What did the model really learn?",
    durationMin: 20,
    level: "core",
    mission:
      "Train a classifier that should learn the true rule. But beware: the training data may contain a tempting shortcut. Can you make the model learn the right idea?",
    studentInstructions: [
      "The true rule: Class A = round objects. But look at the colors...",
      "With a strong shortcut, train the model and read the reliance bars.",
      "Now switch the test world to 'shortcut broken'. Ouch.",
      "Fix the DATA (lower the bias, add examples) until the broken test passes 80%.",
      "Try the linear model too, and add label noise to see reliability drop."
    ],
    component: "DataDetective",
    reflectionQuestions: [
      "What did the model rely on at first? What changed when you fixed the dataset?"
    ],
    noticePoints: [
      "The model never hears our intentions; it only sees statistics in the training data.",
      "High training accuracy can hide a shortcut that fails on new worlds.",
      "Fixing the DATA fixed the model, without touching the learner."
    ],
    takeaway:
      "A model learns from the data it sees. If the data contains shortcuts, the model may learn the shortcut instead of the idea we had in mind. Good training data is part of the algorithm.",
    underTheHood:
      "Two toy learners on hand-designed shape/color features: a 'lazy' one-feature picker (chooses the single most predictive feature) and a tiny logistic regression trained by gradient descent. The datasets are generated with a shortcut correlation you control; reliance bars show each feature's learned weight.",
    teacherNotes: [
      "Place after the generalization challenge: this is generalization failing for a reason students can SEE. 15 to 25 minutes.",
      "The lazy learner is deliberately simplified (it picks one feature) so shortcut learning is vivid; say so.",
      "Discussion: did the model learn the real rule or the shortcut? Why did high training accuracy not mean the model was good?",
      "Discussion: how could this happen in real systems? (Wolves vs huskies with snowy backgrounds is the classic story.)",
      "Do not over-explain logistic regression; the reliance bars carry the idea."
    ]
  },
  {
    hidden: true,
    id: "feature-detector-lab",
    dayId: "learning-machines",
    title: "Feature Detector Lab",
    subtitle: "From pixels to parts",
    durationMin: 20,
    level: "core",
    mission:
      "A digit is just a grid of pixels to the computer. Build a small team of detectors that recognizes what matters.",
    studentInstructions: [
      "Pick a digit and hover the detectors: each one watches a zone of the image.",
      "Read the activation score: how strongly does the zone light up?",
      "Click detectors to build a team; the digit scores use only your team.",
      "Budget mode: classify all the variants with at most 3 detectors.",
      "Switch to shifted or noisy variants and watch detectors fail."
    ],
    component: "FeatureDetectorLab",
    reflectionQuestions: [
      "Which detector was most useful? Which digit pair was hardest to distinguish?"
    ],
    noticePoints: [
      "A hidden unit can act like a detector for a simple pattern: a stroke, a corner, a loop.",
      "No single detector recognizes a digit; teams of simple detectors do.",
      "These detectors are hand-made and fixed; real networks LEARN theirs from data."
    ],
    takeaway:
      "Neural networks can build useful intermediate representations. Early units may detect simple patterns. Later units can combine them into more complex concepts.",
    underTheHood:
      "Each detector fires on the fraction of its 8×8 zone that is inked; classification is nearest-prototype over the activation patterns of stored digit variants, restricted to the detectors you selected. Everything is hand-made and fixed: real networks LEARN their detectors from data.",
    teacherNotes: [
      "Connects the NN playground to the digit-recognition story in the slides: pixels, strokes, parts, digits. 15 to 25 minutes.",
      "Discussion: which simple patterns helped recognize the digit? Why are several detectors better than one?",
      "Discussion: what might deeper layers detect? (Combinations of these: loops plus strokes make an 8.)",
      "The classifier is a nearest-prototype match over detector activations, fully transparent, no training.",
      "Do not over-explain convolution; 'a unit watching a zone' is enough today."
    ]
  }

];

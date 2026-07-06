import type { LabModule } from "../../lib/types";

/**
 * Learning Machines section (currently shown as "Day 2").
 * Semantic ids everywhere so day numbering can be dropped later.
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
    teacherNotes: [
      "This is the parameters-and-loss anchor for everything that follows. 15 to 20 minutes.",
      "Make students fit by hand FIRST, so the computer's instant answer feels meaningful.",
      "The outlier trap previews robustness; the curved dataset previews model families and LM6.",
      "Common confusion: loss of 0 is usually impossible with noise; best-possible loss is shown for calibration.",
      "Discussion question: who chose what 'wrong' means? (We did, by picking squared error.)"
    ]
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
      "Switch datasets and see how the valley moves."
    ],
    component: "LossLandscape",
    reflectionQuestions: [
      "What does one single point on the map represent?",
      "Why does the valley move when the data changes?"
    ],
    noticePoints: [
      "Slope and intercept form a 2D parameter space; the color is the loss.",
      "One dot on the map = one complete model on the left.",
      "Training is a search on this landscape. Real networks have millions of dimensions, same idea."
    ],
    takeaway:
      "Learning is an optimization problem. The model moves through parameter space looking for lower loss.",
    teacherNotes: [
      "The key conceptual jump of the day: from 'moving a line' to 'moving through parameter space'. 15 to 20 minutes.",
      "Ask: where is the line y = 2x - 1 on this map? (One exact point.)",
      "The outlier dataset visibly drags the valley: the data shapes the landscape.",
      "Common confusion: students mix up data space (left) and parameter space (right). Keep naming them.",
      "Discussion question: what would this map look like with three parameters? A million?"
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
      "Race: reach loss below 0.15 in as few steps as possible."
    ],
    component: "GradientDescentRace",
    reflectionQuestions: [
      "Why does a too-large learning rate make the loss bounce instead of fall?",
      "What information does the model use to decide the direction of each step?"
    ],
    noticePoints: [
      "Gradient descent repeatedly moves the parameters a little bit downhill.",
      "The learning rate controls the step size. Too small is slow. Too large can jump past the valley.",
      "Nobody tells the model the answer; the slope of the landscape is enough."
    ],
    takeaway:
      "Gradient descent is simple but sensitive. A step that is too small wastes time. A step that is too large can miss the valley.",
    teacherNotes: [
      "Suggested timing: 20 to 30 minutes. Students should see that gradient descent is iterative and sensitive to the learning rate.",
      "Ask them to intentionally make it fail, then rescue it with a smaller step size.",
      "The trajectory dots fade from old to new; bouncing across the valley is clearly visible at high learning rates.",
      "Common confusion: 'the computer knows where the valley is'. It only ever feels the local slope.",
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
    teacherNotes: [
      "The finale: 30 to 40 minutes, mostly free exploration around the challenge cards.",
      "Force the zero-hidden-layers start: seeing one boundary fail on XOR is the whole lesson of hidden layers.",
      "Spiral usually needs 2 to 3 hidden layers of 6 to 8 tanh neurons and some patience; that IS the discussion about architecture.",
      "The noisy spiral connects back to generalization: watch the train/test gap.",
      "Common confusion: more neurons is not always better; show the parameter count and talk about cost.",
      "Discussion question: this network has ~100 parameters. GPT-2 has 124 million. Same principles."
    ],
    wide: true
  }
];

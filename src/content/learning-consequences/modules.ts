import type { LabModule } from "../../lib/types";

/**
 * Learning by Consequences section (reinforcement learning).
 * Two core modules on a shared gridworld Q-learning engine
 * (src/lib/rl/) plus a bonus continuous-control demo. Maps and reward
 * scenarios live in maps.ts and scenarios.ts; loopholes, fixes, and
 * challenge thresholds are verified by simulation in scripts/qa_rl.ts.
 */

export const learningConsequencesModules: LabModule[] = [
  {
    id: "maze-learner",
    dayId: "learning-consequences",
    title: "Maze Learner",
    subtitle: "No teacher, only rewards",
    durationMin: 35,
    level: "core",
    mission:
      "Train an agent to reach the goal. Nobody tells it the right path: it tries actions, collects rewards and mistakes, and slowly builds a strategy.",
    studentInstructions: [
      "Press 'Watch one episode': the untrained agent stumbles around.",
      "Train 10, then 100 episodes. Watch the reward curve climb.",
      "Turn on the policy arrows: that is the learned strategy.",
      "Turn on the value heatmap: green means 'good square to be in'.",
      "Play with exploration and the learning rate. Then try the other maps."
    ],
    component: "MazeLearner",
    reflectionQuestions: [
      "What changed when exploration was too low or too high?"
    ],
    noticePoints: [
      "The core loop: agent acts, environment responds, reward arrives, behavior updates.",
      "Early episodes are chaotic; the strategy appears gradually, over many attempts.",
      "The policy arrows ARE the learning result: one preferred move per square.",
      "Exploration is a dial: too little gets stuck in habits, too much never settles."
    ],
    takeaway:
      "Reinforcement learning is learning from consequences. The behavior that emerges depends on the reward signal and on how much the agent explores.",
    underTheHood:
      "Real tabular Q-learning running live: the agent stores a score Q(square, move) for every pair, and after each step nudges it toward reward + γ·(best score of the next square) with learning rate α (defaults α=0.2, γ=0.9). Exploration is ε-greedy: with probability ε the move is random. No neural network: the whole 'brain' is a table you can visualize as arrows and colors.",
    teacherNotes: [
      "The section opener: give it 30 to 40 minutes with free play.",
      "Frame the contrast first: supervised = answers given, unsupervised = no labels, here = only consequences.",
      "'Watch one episode' before any training is the money shot: pure stumbling. Repeat after 100 episodes.",
      "Ties in the learned scores are broken in a fixed order ON PURPOSE: with exploration at Low on the Exploration trap map the agent visibly repeats the same wall bump forever. That is the exploration lesson.",
      "The Swamp shortcut map flips its best route when the step cost changes (-0.1 vs -1): rewards define 'best', not geometry.",
      "Common confusion: 'the agent sees the maze'. It only knows which square it is in and the scores it wrote so far."
    ],
    wide: true
  },
  {
    id: "reward-hacking",
    dayId: "learning-consequences",
    title: "Reward Hacking Lab",
    subtitle: "It does what you reward, not what you want",
    durationMin: 30,
    level: "challenge",
    mission:
      "Design rewards for an agent. Then watch it find loopholes, and fix your design.",
    studentInstructions: [
      "Pick a scenario and read the INTENDED goal.",
      "Predict what the agent will actually learn. Commit to your prediction!",
      "Train 100-500 episodes and read the 'What happened?' panel.",
      "Watch one episode to see the loophole with your own eyes.",
      "Change the rewards in the fix panel and retrain. Did the loophole close?"
    ],
    component: "RewardHackingLab",
    reflectionQuestions: [
      "What did the agent optimize that was different from the intended goal?",
      "Where else (school? apps? society?) do rewards produce unintended behavior?"
    ],
    noticePoints: [
      "The agent optimizes the reward you wrote, not the goal you meant.",
      "Each loophole is perfectly rational: farming coins or hugging walls really is the best strategy under the broken reward.",
      "Fixing an RL system usually means changing the reward or environment, not just training longer.",
      "Penalties can backfire too: punish mistakes too hard and the agent stops trying."
    ],
    takeaway:
      "Reinforcement learning does not understand our intentions. It optimizes the rewards we give, and if the reward is wrong, the learned behavior can be wrong in a very clever way. Specifying goals is hard.",
    underTheHood:
      "Same tabular Q-learning engine and gridworld as the Maze Learner, with scenario-specific reward rules: respawning coins, a bonus for standing next to the goal, a -100 trap penalty on an icy floor (15% of moves slip randomly), and a bonus for pressing right. Every loophole and every fix shown here was verified by simulation; the 'What happened?' panel reads simple statistics of the last 20 episodes.",
    teacherNotes: [
      "The heart of the lesson and the bridge to AI alignment. 25 to 35 minutes.",
      "Make groups PREDICT before training, out loud. The wrong predictions are the fun.",
      "Coin Loop: value of farming the coin forever beats the +5 goal under γ=0.9. The math is honest, not scripted.",
      "Almost There: the agent circles next to the goal (~17 steps per episode) farming the proxy bonus before entering.",
      "Coward Agent: with -100 traps on ice, hiding is genuinely the OPTIMAL policy. Ask: did the agent fail, or did the reward designer?",
      "Wall Hugger: paying for right moves means bumping the right wall forever beats finishing.",
      "Real-world hooks: recommendation engines optimizing clicks, students optimizing grades, the classic boat-racing RL demo."
    ],
    wide: true
  },
  {
    id: "rocket-landing",
    dayId: "learning-consequences",
    title: "Rocket Landing",
    subtitle: "Bonus demo: continuous control",
    durationMin: 15,
    level: "challenge",
    mission:
      "Land a rocket softly using the least fuel. Actions are not up/down/left/right anymore: the engine can push with any strength.",
    studentInstructions: [
      "Press Launch with the starting knobs: enjoy the crash.",
      "Tune the three policy knobs by hand until the landing is soft.",
      "Now press random search: the computer tries 150 policies and keeps the best.",
      "Raise the fuel penalty and search again. What changed in the landing style?"
    ],
    component: "RocketLanding",
    reflectionQuestions: [
      "What tradeoff did the best policy make between safety and fuel?"
    ],
    noticePoints: [
      "In continuous control the action is an amount (thrust 0 to 1), not a choice from four arrows.",
      "A policy can be tiny: here it is three numbers.",
      "Search can replace hand-tuning: try many policies, keep the best. That is optimization again.",
      "The score defines 'best': change the fuel penalty and the best landing style changes."
    ],
    takeaway:
      "In continuous control, actions can be amounts, not just choices. The reward has to balance competing goals such as safety, speed, and fuel. Optimization finds whatever balance the score defines.",
    underTheHood:
      "A tiny physics loop (gravity, thrust, fuel) with a three-parameter policy: braking altitude, target touchdown speed, and thrust aggressiveness. 'Training' is random search: simulate 150 random policies, keep the best score. No deep RL, no neural network; the score is 100 + softness bonus - fuel penalty × fuel used - time penalty, and crashing scores badly.",
    teacherNotes: [
      "Bonus demo, 10 to 15 minutes at the end. Skip without guilt if time runs out.",
      "The arc: hand-tune (hard), then random search (instant): that FEELS like why we automate policy search.",
      "Fuel penalty 0 vs 2 changes the found policy from feather-soft (~0.8 m/s, more fuel burned) to close-to-the-limit (~1.2+ m/s, minimal fuel): reward design again.",
      "Connect forward: replace 'three numbers' with 'millions of weights' and this is how real controllers and game agents are trained."
    ],
    wide: true
  }
];

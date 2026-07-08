import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_REWARDS } from "../../lib/rl/gridworld";
import type { RewardConfig } from "../../lib/rl/gridworld";
import {
  DEFAULT_PARAMS,
  makeQ,
  runEpisode,
  greedyPolicy,
  stateValues,
  greedyRollout
} from "../../lib/rl/qLearning";
import type { EpisodeStats } from "../../lib/rl/qLearning";
import { mapPresets } from "../../content/learning-consequences/maps";
import { GridWorldView, RewardCurve } from "../../components/rl/GridWorldView";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { Slider } from "../../components/controls/Slider";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const EPSILON_PRESETS = [
  { value: 0.02, label: "Low (2%)" },
  { value: 0.2, label: "Medium (20%)" },
  { value: 0.5, label: "High (50%)" },
  { value: 1, label: "Random (100%)" }
];
const ALPHA_PRESETS = [
  { value: 0.05, label: "Slow" },
  { value: 0.2, label: "Normal" },
  { value: 0.5, label: "Fast" }
];

const GLOSSARY: [string, string][] = [
  ["Agent", "the learner that chooses actions."],
  ["Environment", "the world the agent acts in (this maze)."],
  ["State", "the situation the agent is in (its cell)."],
  ["Action", "what it can do: up, right, down, left."],
  ["Reward", "the feedback after an action."],
  ["Policy", "the strategy it has learned (the arrows)."],
  ["Exploration", "trying actions to discover what happens."],
  ["Exploitation", "using what currently seems best."]
];

export default function MazeLearner({ onResult, resetSignal }: ModuleComponentProps) {
  const [mapId, setMapId] = useState(mapPresets[0].id);
  const preset = mapPresets.find((m) => m.id === mapId)!;
  const world = preset.world;

  const [rewards, setRewards] = useState<RewardConfig>({ ...DEFAULT_REWARDS, ...preset.rewards });
  const [epsilon, setEpsilon] = useState(0.2);
  const [alpha, setAlpha] = useState(0.2);
  const [gamma, setGamma] = useState(0.9);
  const [maxSteps, setMaxSteps] = useState(80);
  const [showPolicy, setShowPolicy] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const qRef = useRef(makeQ(world));
  const rngRef = useRef(makeRng(1234));
  const [version, setVersion] = useState(0); // bumped after training mutates Q
  const [history, setHistory] = useState<EpisodeStats[]>([]);
  const [autoTraining, setAutoTraining] = useState(false);
  const timerRef = useRef<number | null>(null);

  // watching one episode: animated playback of a freshly run episode
  const [watchPath, setWatchPath] = useState<{ r: number; c: number }[] | null>(null);
  const [watchStep, setWatchStep] = useState(0);
  const watchTimer = useRef<number | null>(null);

  // for the "shortest vs safest" challenge on the swamp map
  const [routesSeen, setRoutesSeen] = useState({ swamp: false, longWay: false });
  const [randomChallengeDone, setRandomChallengeDone] = useState(false);

  const params = useMemo(
    () => ({ ...DEFAULT_PARAMS, alpha, gamma, epsilon, maxSteps }),
    [alpha, gamma, epsilon, maxSteps]
  );

  const stopTimers = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (watchTimer.current !== null) window.clearInterval(watchTimer.current);
    timerRef.current = null;
    watchTimer.current = null;
    setAutoTraining(false);
  };

  const resetLearning = () => {
    stopTimers();
    qRef.current = makeQ(world);
    rngRef.current = makeRng(1234);
    setHistory([]);
    setWatchPath(null);
    setRoutesSeen({ swamp: false, longWay: false });
    setVersion((v) => v + 1);
  };

  const loadMap = (id: string) => {
    stopTimers();
    const p = mapPresets.find((m) => m.id === id)!;
    setMapId(id);
    setRewards({ ...DEFAULT_REWARDS, ...p.rewards });
    qRef.current = makeQ(p.world);
    rngRef.current = makeRng(1234);
    setHistory([]);
    setWatchPath(null);
    setRoutesSeen({ swamp: false, longWay: false });
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    loadMap(mapPresets[0].id);
    setEpsilon(0.2);
    setAlpha(0.2);
    setGamma(0.9);
    setMaxSteps(80);
    setShowPolicy(true);
    setShowValues(false);
    setRandomChallengeDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => stopTimers, []);

  const afterBatch = (batch: EpisodeStats[]) => {
    setHistory((h) => [...h.slice(-399), ...batch]);
    setVersion((v) => v + 1);
    if (epsilon >= 0.8 && batch.length > 0) setRandomChallengeDone(true);
    if (mapId === "risky") {
      const roll = greedyRollout(world, rewards, qRef.current, 60);
      if (roll.outcome === "goal") {
        setRoutesSeen((s) => ({
          swamp: s.swamp || roll.mudVisited,
          longWay: s.longWay || !roll.mudVisited
        }));
      }
    }
  };

  const trainN = (n: number) => {
    if (watchTimer.current !== null) window.clearInterval(watchTimer.current);
    setWatchPath(null);
    if (n <= 10) {
      const batch: EpisodeStats[] = [];
      for (let i = 0; i < n; i++) batch.push(runEpisode(world, rewards, qRef.current, params, rngRef.current));
      afterBatch(batch);
      return;
    }
    // big batches run in chunks so the UI stays alive
    let left = n;
    timerRef.current = window.setInterval(() => {
      const k = Math.min(25, left);
      const batch: EpisodeStats[] = [];
      for (let i = 0; i < k; i++) batch.push(runEpisode(world, rewards, qRef.current, params, rngRef.current));
      afterBatch(batch);
      left -= k;
      if (left <= 0) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 30);
  };

  const toggleAuto = () => {
    if (autoTraining) {
      stopTimers();
      return;
    }
    if (watchTimer.current !== null) window.clearInterval(watchTimer.current);
    setWatchPath(null);
    setAutoTraining(true);
    timerRef.current = window.setInterval(() => {
      const batch: EpisodeStats[] = [];
      for (let i = 0; i < 10; i++) batch.push(runEpisode(world, rewards, qRef.current, params, rngRef.current));
      afterBatch(batch);
    }, 120);
  };

  const watchEpisode = () => {
    stopTimers();
    const ep = runEpisode(world, rewards, qRef.current, params, rngRef.current);
    afterBatch([ep]);
    setWatchPath(ep.path);
    setWatchStep(0);
    const t0 = performance.now();
    watchTimer.current = window.setInterval(() => {
      const i = Math.floor((performance.now() - t0) / 140);
      setWatchStep(i);
      if (i >= ep.path.length - 1) {
        window.clearInterval(watchTimer.current!);
        watchTimer.current = null;
      }
    }, 70);
  };

  const policy = useMemo(() => greedyPolicy(world, qRef.current), [world, version]);
  const values = useMemo(() => stateValues(world, qRef.current), [world, version]);

  const last = history[history.length - 1];
  const recent = history.slice(-20);
  const success20 = recent.length ? recent.filter((e) => e.outcome === "goal").length / recent.length : 0;

  useEffect(() => {
    onResult(
      `map '${mapId}': ${history.length} episodes, success(last20)=${Math.round(success20 * 100)}%, epsilon=${epsilon}`
    );
  }, [mapId, history.length, success20, epsilon, onResult]);

  const agentPos = watchPath ? watchPath[Math.min(watchStep, watchPath.length - 1)] : null;

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="Map"
          options={mapPresets.map((m) => ({ value: m.id, label: m.label }))}
          value={mapId}
          onChange={loadMap}
        />
        <span className="hintText">{preset.description}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 380px", minWidth: 300 }}>
          <div className="vizStage" style={{ padding: 12 }}>
            <GridWorldView
              world={world}
              agent={agentPos}
              path={watchPath ? watchPath.slice(0, watchStep + 1) : last?.path}
              policy={policy}
              values={values}
              showPolicy={showPolicy}
              showValues={showValues}
            />
          </div>
          <div className="controlRow" style={{ marginTop: 8 }}>
            <label className="hintText" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={showPolicy} onChange={(e) => setShowPolicy(e.target.checked)} />
              policy arrows
            </label>
            <label className="hintText" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
              value heatmap
            </label>
          </div>
          {preset.hint && (
            <p className="hintText" style={{ marginTop: 6 }}>
              {preset.hint}
            </p>
          )}
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <div className="controlRow">
            <button className="btn primary small" onClick={() => trainN(1)}>Train 1</button>
            <button className="btn primary small" onClick={() => trainN(10)}>Train 10</button>
            <button className="btn primary small" onClick={() => trainN(100)}>Train 100</button>
            <button className={"btn small " + (autoTraining ? "subtle" : "accent")} onClick={toggleAuto}>
              {autoTraining ? "⏸ Pause" : "▶ Auto train"}
            </button>
          </div>
          <div className="controlRow" style={{ marginTop: 8 }}>
            <button className="btn accent small" onClick={watchEpisode}>👀 Watch one episode</button>
            <button className="btn subtle small" onClick={resetLearning}>🧽 Reset learning</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="sliderHead" style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>Exploration (chance of a random move)</span>
            </div>
            <Segmented
              ariaLabel="Exploration"
              options={EPSILON_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              value={EPSILON_PRESETS.find((p) => Math.abs(p.value - epsilon) < 1e-9)?.value ?? -1}
              onChange={(v) => setEpsilon(v)}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="sliderHead" style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>Learning rate (how big each update is)</span>
            </div>
            <Segmented
              ariaLabel="Learning rate"
              options={ALPHA_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              value={ALPHA_PRESETS.find((p) => Math.abs(p.value - alpha) < 1e-9)?.value ?? -1}
              onChange={(v) => setAlpha(v)}
            />
          </div>

          <div className="controlRow" style={{ marginTop: 12 }}>
            <span className="statPill">
              episodes <span className="statValue">{history.length}</span>
            </span>
            <span className="statPill">
              last reward <span className="statValue">{last ? last.reward.toFixed(1) : "-"}</span>
            </span>
            <span className="statPill">
              last steps <span className="statValue">{last ? last.steps : "-"}</span>
            </span>
            <span className="statPill">
              success (last 20) <span className="statValue">{recent.length ? `${Math.round(success20 * 100)}%` : "-"}</span>
            </span>
          </div>

          <div style={{ marginTop: 10 }}>
            <RewardCurve rewards={history.map((e) => e.reward)} />
          </div>

          <div className="controlRow" style={{ marginTop: 10 }}>
            <button className="btn subtle small" onClick={() => setShowAdvanced((s) => !s)}>
              {showAdvanced ? "Hide advanced" : "⚙️ Advanced controls"}
            </button>
            <button className="btn subtle small" onClick={() => setShowGlossary((s) => !s)}>
              {showGlossary ? "Hide glossary" : "📖 Glossary"}
            </button>
          </div>
          {showAdvanced && (
            <div className="fadeIn" style={{ marginTop: 8 }}>
              <Slider label="Step cost" value={rewards.step} min={-1} max={0} step={0.05} onChange={(v) => setRewards((r) => ({ ...r, step: v }))} format={(v) => v.toFixed(2)} />
              <Slider label="Trap penalty" value={rewards.trap} min={-50} max={0} step={1} onChange={(v) => setRewards((r) => ({ ...r, trap: v }))} format={(v) => v.toFixed(0)} />
              <Slider label="Wall bump penalty" value={rewards.wallBump} min={-2} max={0} step={0.1} onChange={(v) => setRewards((r) => ({ ...r, wallBump: v }))} format={(v) => v.toFixed(1)} />
              <Slider label="Discount factor (patience)" value={gamma} min={0.5} max={0.99} step={0.01} onChange={setGamma} format={(v) => v.toFixed(2)} />
              <Slider label="Max steps per episode" value={maxSteps} min={30} max={200} step={10} onChange={setMaxSteps} format={(v) => v.toFixed(0)} />
              <p className="hintText">Changing rewards changes the problem: press reset learning for a fair retrain.</p>
            </div>
          )}
          {showGlossary && (
            <div className="fadeIn hintText" style={{ marginTop: 8 }}>
              {GLOSSARY.map(([term, def]) => (
                <div key={term} style={{ marginBottom: 2 }}>
                  <strong>{term}:</strong> {def}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "random",
            title: "Random is not learning",
            goal: "Set exploration to Random (100%) and train 10 episodes. Watch one: is this a strategy?",
            done: randomChallengeDone
          },
          {
            id: "fast-learner",
            title: "Find the fastest learner",
            goal: "Tune exploration and learning rate, then reach at least 80% success over the last 20 episodes. How few training episodes can you manage?",
            done: recent.length >= 20 && success20 >= 0.8
          },
          {
            id: "explore-compare",
            title: "Too little vs too much",
            goal: "On the Exploration trap map, reset learning and train 100 with exploration Low, then again with Medium, then Random. Compare the success rates."
          },
          {
            id: "route-flip",
            title: "Shortest path vs safest path",
            goal: "On the Swamp shortcut map: train until the arrows commit to a route. Then change the step cost (advanced), reset learning, retrain. Make the agent choose BOTH routes at least once.",
            done: routesSeen.swamp && routesSeen.longWay
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        The agent remembers how good each move looked from each square. After every attempt it
        adjusts those scores a little. Nobody ever tells it the path: rewards do all the teaching.
      </p>
    </div>
  );
}

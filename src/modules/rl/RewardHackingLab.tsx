import { useEffect, useMemo, useRef, useState } from "react";
import type { RewardConfig } from "../../lib/rl/gridworld";
import {
  DEFAULT_PARAMS,
  makeQ,
  runEpisode,
  greedyPolicy
} from "../../lib/rl/qLearning";
import type { EpisodeStats } from "../../lib/rl/qLearning";
import { rlScenarios } from "../../content/learning-consequences/scenarios";
import { GridWorldView, RewardCurve } from "../../components/rl/GridWorldView";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Segmented } from "../../components/controls/Segmented";
import { Slider } from "../../components/controls/Slider";
import { makeRng } from "../../lib/learning/rng";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/** Heuristic "What happened?" summary from the last 20 episodes. */
function diagnose(
  scenarioId: string,
  recent: EpisodeStats[]
): { text: string; fixed: boolean } | null {
  if (recent.length < 10) return null;
  const n = recent.length;
  const success = recent.filter((e) => e.outcome === "goal").length / n;
  const timeouts = recent.filter((e) => e.outcome === "timeout").length / n;
  const coins = recent.reduce((a, e) => a + e.coins, 0) / n;
  const near = recent.reduce((a, e) => a + e.nearGoalSteps, 0) / n;
  const bumps = recent.reduce((a, e) => a + e.wallBumps, 0) / n;
  const pct = `The agent reached the goal in ${Math.round(success * 100)}% of recent episodes.`;
  if (scenarioId === "coin-loop" && coins >= 5) {
    return { text: `${pct} It collected the coin ${coins.toFixed(0)} times per episode: it farms points instead of finishing.`, fixed: false };
  }
  if (scenarioId === "almost-goal" && near >= 8) {
    return { text: `${pct} But it spent ${near.toFixed(0)} steps per episode circling right NEXT to the goal, farming the bonus before entering.`, fixed: false };
  }
  if (scenarioId === "coward" && timeouts >= 0.3) {
    return { text: `${pct} In ${Math.round(timeouts * 100)}% of episodes it just hid far from the traps until time ran out.`, fixed: false };
  }
  if (scenarioId === "wall-hugger" && bumps >= 15) {
    return { text: `${pct} It pushed into walls ${bumps.toFixed(0)} times per episode: pressing RIGHT pays even when nothing moves.`, fixed: false };
  }
  if (success >= 0.8) {
    return { text: `${pct} The loophole seems closed: the behavior matches the intention now.`, fixed: true };
  }
  return { text: `${pct} Something is still off: watch an episode and check what it is really optimizing.`, fixed: false };
}

export default function RewardHackingLab({ onResult, resetSignal }: ModuleComponentProps) {
  const [scenarioId, setScenarioId] = useState(rlScenarios[0].id);
  const scenario = rlScenarios.find((s) => s.id === scenarioId)!;
  const world = scenario.world;

  const [rewards, setRewards] = useState<RewardConfig>({ ...scenario.rewards });
  const [epsilon, setEpsilon] = useState(scenario.epsilon);
  const qRef = useRef(makeQ(world));
  const rngRef = useRef(makeRng(77));
  const [version, setVersion] = useState(0);
  const [history, setHistory] = useState<EpisodeStats[]>([]);
  const timerRef = useRef<number | null>(null);
  const [training, setTraining] = useState(false);

  const [watchPath, setWatchPath] = useState<{ r: number; c: number }[] | null>(null);
  const [watchStep, setWatchStep] = useState(0);
  const watchTimer = useRef<number | null>(null);

  // remembers whether the loophole was ever observed (for the fix challenges)
  const [sawLoophole, setSawLoophole] = useState<Record<string, boolean>>({});

  const params = useMemo(() => ({ ...DEFAULT_PARAMS, epsilon }), [epsilon]);

  const stopTimers = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (watchTimer.current !== null) window.clearInterval(watchTimer.current);
    timerRef.current = null;
    watchTimer.current = null;
    setTraining(false);
  };

  const resetLearning = () => {
    stopTimers();
    qRef.current = makeQ(world);
    rngRef.current = makeRng(77);
    setHistory([]);
    setWatchPath(null);
    setVersion((v) => v + 1);
  };

  const loadScenario = (id: string) => {
    stopTimers();
    const sc = rlScenarios.find((s) => s.id === id)!;
    setScenarioId(id);
    setRewards({ ...sc.rewards });
    setEpsilon(sc.epsilon);
    qRef.current = makeQ(sc.world);
    rngRef.current = makeRng(77);
    setHistory([]);
    setWatchPath(null);
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    loadScenario(rlScenarios[0].id);
    setSawLoophole({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => stopTimers, []);

  /** Rewards changed: the problem changed, so the agent starts fresh. */
  const updateRewards = (patch: Partial<RewardConfig>) => {
    stopTimers();
    setRewards((r) => ({ ...r, ...patch }));
    qRef.current = makeQ(world);
    rngRef.current = makeRng(77);
    setHistory([]);
    setWatchPath(null);
    setVersion((v) => v + 1);
  };

  const trainN = (n: number) => {
    if (watchTimer.current !== null) window.clearInterval(watchTimer.current);
    setWatchPath(null);
    setTraining(true);
    let left = n;
    timerRef.current = window.setInterval(() => {
      const k = Math.min(30, left);
      const batch: EpisodeStats[] = [];
      for (let i = 0; i < k; i++) batch.push(runEpisode(world, rewards, qRef.current, params, rngRef.current));
      setHistory((h) => [...h.slice(-399), ...batch]);
      setVersion((v) => v + 1);
      left -= k;
      if (left <= 0) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        setTraining(false);
      }
    }, 25);
  };

  const watchEpisode = () => {
    stopTimers();
    const ep = runEpisode(world, rewards, qRef.current, params, rngRef.current);
    setHistory((h) => [...h.slice(-399), ep]);
    setVersion((v) => v + 1);
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
  const recent = history.slice(-20);
  const success20 = recent.length ? recent.filter((e) => e.outcome === "goal").length / recent.length : 0;
  const report = diagnose(scenarioId, recent);

  useEffect(() => {
    if (report && !report.fixed && history.length >= 50) {
      setSawLoophole((s) => (s[scenarioId] ? s : { ...s, [scenarioId]: true }));
    }
  }, [report, history.length, scenarioId]);

  useEffect(() => {
    onResult(
      `scenario '${scenarioId}': ${history.length} episodes, success(last20)=${Math.round(success20 * 100)}%`
    );
  }, [scenarioId, history.length, success20, onResult]);

  const agentPos = watchPath ? watchPath[Math.min(watchStep, watchPath.length - 1)] : null;

  return (
    <div className="panel">
      <div className="controlRow" style={{ marginBottom: 12 }}>
        <Segmented
          ariaLabel="Scenario"
          options={rlScenarios.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }))}
          value={scenarioId}
          onChange={loadScenario}
        />
      </div>

      <div className="missionCard" style={{ marginBottom: 12 }}>
        <div className="missionLabel">Intended goal</div>
        <p className="missionText" style={{ fontSize: 16 }}>{scenario.intendedGoal}</p>
        <div className="controlRow" style={{ marginTop: 8 }}>
          {scenario.ruleSummary.map((rule, i) => (
            <span key={i} className="statPill" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>
              {rule}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 380px", minWidth: 300 }}>
          <div className="vizStage" style={{ padding: 12 }}>
            <GridWorldView
              world={world}
              agent={agentPos}
              path={watchPath ? watchPath.slice(0, watchStep + 1) : history[history.length - 1]?.path}
              policy={policy}
              showPolicy
            />
          </div>
          <p className="hintText" style={{ marginTop: 8 }}>
            🤔 <strong>Predict first:</strong> {scenario.predictPrompt}
          </p>
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <div className="controlRow">
            <button className="btn primary small" onClick={() => trainN(100)} disabled={training}>
              Train 100
            </button>
            <button className="btn primary small" onClick={() => trainN(500)} disabled={training}>
              Train 500
            </button>
            <button className="btn accent small" onClick={watchEpisode}>👀 Watch one episode</button>
            <button className="btn subtle small" onClick={resetLearning}>🧽 Reset learning</button>
          </div>

          <div className="controlRow" style={{ marginTop: 10 }}>
            <span className="statPill">
              episodes <span className="statValue">{history.length}</span>
            </span>
            <span className="statPill">
              success (last 20) <span className="statValue">{recent.length ? `${Math.round(success20 * 100)}%` : "-"}</span>
            </span>
          </div>

          {report && (
            <div
              className="panel tight fadeIn"
              style={{
                marginTop: 10,
                background: report.fixed ? "var(--green-soft)" : "var(--amber-soft)",
                border: `1.5px solid ${report.fixed ? "var(--green)" : "var(--amber-deep)"}`
              }}
            >
              <div className="panelTitle">What happened?</div>
              <p style={{ fontSize: 14, margin: 0 }}>{report.text}</p>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <RewardCurve rewards={history.map((e) => e.reward)} height={100} />
          </div>

          <div className="panelTitle" style={{ marginTop: 12 }}>Fix the reward</div>
          {scenario.fixes.map((fix) => {
            if (fix.kind === "toggle") {
              return (
                <label
                  key={fix.key}
                  className="hintText"
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={rewards.coinsRespawn}
                    onChange={(e) => updateRewards({ coinsRespawn: e.target.checked })}
                  />
                  {fix.label}
                </label>
              );
            }
            if (fix.kind === "slider") {
              return (
                <Slider
                  key={fix.key}
                  label={fix.label}
                  value={rewards[fix.key] as number}
                  min={fix.min}
                  max={fix.max}
                  step={fix.step}
                  onChange={(v) => updateRewards({ [fix.key]: v } as Partial<RewardConfig>)}
                  format={(v) => v.toFixed(2)}
                />
              );
            }
            return null;
          })}
          <Slider
            label="Exploration"
            value={epsilon}
            min={0.02}
            max={0.5}
            step={0.01}
            onChange={setEpsilon}
            format={(v) => v.toFixed(2)}
          />
          <p className="hintText" style={{ marginTop: 4 }}>
            💡 {scenario.fixHint} (Changing a reward resets the learning: the problem itself changed.)
          </p>
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "fix-coin-loop",
            title: "Fix the Coin Loop",
            goal: "On Coin Loop: first watch the loophole happen, then change the rewards so the agent reaches the goal in at least 80% of recent episodes while the coin still pays +1.",
            done: !!sawLoophole["coin-loop"] && scenarioId === "coin-loop" && rewards.coin > 0 && recent.length >= 20 && success20 >= 0.8
          },
          {
            id: "safe-not-frozen",
            title: "Safe but not frozen",
            goal: "On Coward Agent: see the hiding behavior, then tune the rewards until the agent reaches the goal in at least 70% of recent episodes. Tip: train 500, the ice makes learning slow.",
            done: !!sawLoophole["coward"] && scenarioId === "coward" && recent.length >= 20 && success20 >= 0.7
          },
          {
            id: "own-loophole",
            title: "Create your own loophole",
            goal: "Pick any scenario that is currently fixed and adjust rewards to break it in a NEW way. Explain the loophole to your neighbors."
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        The agent never hears our intentions. It optimizes exactly the rewards we wrote, and if the
        reward is wrong, the learned behavior can be wrong in a very clever way.
      </p>
    </div>
  );
}

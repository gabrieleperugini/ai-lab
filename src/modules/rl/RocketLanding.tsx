import { useEffect, useRef, useState } from "react";
import {
  simulate,
  randomSearch,
  SAFE_SPEED,
  START_HEIGHT,
  START_FUEL
} from "../../lib/rl/rocket";
import type { RocketPolicy, RocketRun } from "../../lib/rl/rocket";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import { Slider } from "../../components/controls/Slider";
import type { ModuleComponentProps } from "../../lib/moduleProps";

const W = 300;
const H = 360;

function RocketScene({ run, tick }: { run: RocketRun | null; tick: number }) {
  const h = run ? run.heights[Math.min(tick, run.heights.length - 1)] : START_HEIGHT;
  const thrust = run ? run.thrusts[Math.min(tick, run.thrusts.length - 1)] : 0;
  const done = run !== null && tick >= run.heights.length - 1;
  const y = 30 + (1 - h / START_HEIGHT) * (H - 90);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Rocket landing animation" style={{ display: "block", maxWidth: 320 }}>
      <rect x={0} y={0} width={W} height={H} fill="#101830" rx={10} />
      {/* stars */}
      {[[40, 50], [220, 90], [120, 30], [260, 180], [60, 220], [180, 140]].map(([x, yy], i) => (
        <circle key={i} cx={x} cy={yy} r={1.6} fill="#8ea2d0" />
      ))}
      {/* ground */}
      <rect x={0} y={H - 26} width={W} height={26} fill="#3d4459" />
      <rect x={W / 2 - 40} y={H - 30} width={80} height={6} fill="var(--amber)" rx={2} />
      {/* rocket */}
      <g transform={`translate(${W / 2}, ${y})`}>
        <text textAnchor="middle" fontSize={30} y={4}>
          {done ? (run!.outcome === "safe" ? "🚀" : "💥") : "🚀"}
        </text>
        {thrust > 0.02 && !done && (
          <text textAnchor="middle" fontSize={14 + thrust * 14} y={26 + thrust * 6}>
            🔥
          </text>
        )}
      </g>
      {done && (
        <text x={W / 2} y={70} textAnchor="middle" fontSize={17} fontWeight={800} fill={run!.outcome === "safe" ? "#7fdcA8" : "#ff8f98"}>
          {run!.outcome === "safe"
            ? `Soft landing! ${run!.touchdownSpeed.toFixed(1)} m/s`
            : run!.outcome === "crash"
              ? `Crash at ${run!.touchdownSpeed.toFixed(1)} m/s`
              : "Never landed"}
        </text>
      )}
    </svg>
  );
}

function TinyChart({ label, series, color, yZero }: { label: string; series: number[]; color: string; yZero?: boolean }) {
  const CW = 300;
  const CH = 84;
  if (series.length < 2) return null;
  const lo = Math.min(...series, yZero ? 0 : Infinity);
  const hi = Math.max(...series, 1);
  const sx = (i: number) => (i / (series.length - 1)) * (CW - 10) + 5;
  const sy = (v: number) => CH - 6 - ((v - lo) / (hi - lo + 1e-9)) * (CH - 22);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" role="img" aria-label={label}>
      <rect x={0} y={0} width={CW} height={CH} fill="var(--paper-2)" rx={8} />
      <polyline points={series.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke={color} strokeWidth={2.2} />
      <text x={7} y={13} fontSize={10.5} fontWeight={700} fill="var(--ink-faint)">{label}</text>
    </svg>
  );
}

export default function RocketLanding({ onResult, resetSignal }: ModuleComponentProps) {
  const [policy, setPolicy] = useState<RocketPolicy>({ brakeAlt: 20, touchSpeed: 5, gain: 0.3 });
  const [fuelPenalty, setFuelPenalty] = useState(0.3);
  const [run, setRun] = useState<RocketRun | null>(null);
  const [tick, setTick] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchInfo, setSearchInfo] = useState<string>("");
  const timerRef = useRef<number | null>(null);
  const seedRef = useRef(7);

  const stopTimer = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const launch = (p: RocketPolicy) => {
    stopTimer();
    const r = simulate(p, { fuelPenalty });
    setRun(r);
    setTick(0);
    // wall-clock based playback: robust even when timers are throttled
    const t0 = performance.now();
    timerRef.current = window.setInterval(() => {
      const i = Math.floor((performance.now() - t0) / 26);
      setTick(i);
      if (i >= r.heights.length - 1) stopTimer();
    }, 50);
  };

  const doSearch = () => {
    stopTimer();
    setSearching(true);
    // small async delay so the button state paints first
    window.setTimeout(() => {
      const { best, bestRun, tried } = randomSearch({ fuelPenalty }, 150, seedRef.current);
      seedRef.current += 1;
      setPolicy({
        brakeAlt: Math.round(best.brakeAlt),
        touchSpeed: Math.round(best.touchSpeed * 10) / 10,
        gain: Math.round(best.gain * 100) / 100
      });
      setSearchInfo(
        `Tried 150 random policies. Best score: ${bestRun.score} (${tried.filter((s) => s > 0).length} of them landed safely).`
      );
      setSearching(false);
      launch(best);
    }, 30);
  };

  useEffect(() => {
    stopTimer();
    setPolicy({ brakeAlt: 20, touchSpeed: 5, gain: 0.3 });
    setFuelPenalty(0.3);
    setRun(null);
    setTick(0);
    setSearchInfo("");
  }, [resetSignal]);

  useEffect(() => stopTimer, []);

  const finished = run !== null && tick >= run.heights.length - 1;

  useEffect(() => {
    if (finished && run) {
      onResult(
        `policy (${policy.brakeAlt}, ${policy.touchSpeed}, ${policy.gain}): ${run.outcome}, v=${run.touchdownSpeed.toFixed(1)}, fuel left ${run.fuelLeft.toFixed(0)}%, score ${run.score}`
      );
    }
  }, [finished, run, policy, onResult]);

  const shownTick = run ? Math.min(tick, run.heights.length - 1) : 0;
  const fuelNow = run ? run.fuels[shownTick] : START_FUEL;

  return (
    <div className="panel">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 320px", minWidth: 260 }}>
          <div className="vizStage" style={{ padding: 12 }}>
            <RocketScene run={run} tick={tick} />
          </div>
          <div className="controlRow" style={{ marginTop: 8 }}>
            <span className="statPill">
              fuel <span className="statValue">{fuelNow.toFixed(0)}%</span>
            </span>
            {finished && run && (
              <span className="statPill">
                score <span className="statValue">{run.score}</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <p className="hintText" style={{ marginTop: 0 }}>
            The policy is just three numbers. Thrust turns on below the braking altitude and pushes
            the fall speed toward the target. Tune it by hand, or let random search try 150
            policies and keep the best.
          </p>
          <Slider
            label="Braking altitude (when the engine wakes up)"
            value={policy.brakeAlt}
            min={10}
            max={100}
            step={1}
            onChange={(v) => setPolicy((p) => ({ ...p, brakeAlt: v }))}
            format={(v) => v.toFixed(0)}
          />
          <Slider
            label="Target touchdown speed"
            value={policy.touchSpeed}
            min={0.5}
            max={6}
            step={0.1}
            onChange={(v) => setPolicy((p) => ({ ...p, touchSpeed: v }))}
            format={(v) => v.toFixed(1)}
            lowHint="feather"
            highHint={`crash limit is ${SAFE_SPEED}`}
          />
          <Slider
            label="Thrust aggressiveness"
            value={policy.gain}
            min={0.1}
            max={2}
            step={0.01}
            onChange={(v) => setPolicy((p) => ({ ...p, gain: v }))}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Fuel penalty (in the score)"
            value={fuelPenalty}
            min={0}
            max={2}
            step={0.05}
            onChange={setFuelPenalty}
            format={(v) => v.toFixed(2)}
          />
          <div className="controlRow" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={() => launch(policy)}>🚀 Launch</button>
            <button className="btn accent" onClick={doSearch} disabled={searching}>
              {searching ? "Searching..." : "🎲 Random search (150 tries)"}
            </button>
          </div>
          {searchInfo && (
            <p className="hintText fadeIn" style={{ marginTop: 8 }}>
              {searchInfo} The sliders now show the best policy found.
            </p>
          )}
          {run && finished && (
            <div style={{ marginTop: 10 }}>
              <TinyChart label="height over time" series={run.heights} color="var(--blue)" />
              <div style={{ height: 6 }} />
              <TinyChart label="fall speed over time (crash limit 3)" series={run.velocities} color="var(--red)" yZero />
            </div>
          )}
        </div>
      </div>

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      <ChallengeCards
        challenges={[
          {
            id: "safe",
            title: "Safe landing",
            goal: "Tune the three policy knobs BY HAND until the rocket lands below 3 m/s.",
            done: finished && run?.outcome === "safe"
          },
          {
            id: "fuel-saver",
            title: "Fuel saver",
            goal: "Land safely with at least 30% fuel remaining.",
            done: finished && run?.outcome === "safe" && (run?.fuelLeft ?? 0) >= 30
          },
          {
            id: "tradeoff",
            title: "Reward tradeoff",
            goal: "Run the random search with fuel penalty 0, then with 2. Compare the touchdown speed and fuel left: how does the score change what 'best' means?"
          }
        ]}
      />

      <p className="hintText" style={{ marginTop: 12 }}>
        In continuous control, actions are amounts, not just choices. The score has to balance
        competing goals: touch down softly, do not waste fuel, do not take forever. Change the
        balance and the best behavior changes with it.
      </p>
    </div>
  );
}

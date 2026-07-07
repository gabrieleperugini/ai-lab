import { useEffect, useMemo, useRef, useState } from "react";
import { fEasy, f1d, f2d, deriv, grad2 } from "../../lib/learning/gradients";
import { Slider } from "../../components/controls/Slider";
import { Segmented } from "../../components/controls/Segmented";
import { ChallengeCards } from "../../components/learning/ChallengeCards";
import type { ModuleComponentProps } from "../../lib/moduleProps";

/* ---------------- 1D panel ---------------- */

const W1 = 600;
const H1 = 300;
const X_RANGE = 5;

function OneDPlot({
  f,
  x0,
  onDrag
}: {
  f: (x: number) => number;
  x0: number;
  onDrag: (x: number) => void;
}) {
  const dragRef = useRef(false);

  const { yLo, yHi } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const y = f(-X_RANGE + (2 * X_RANGE * i) / 200);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    const pad = 0.15 * (hi - lo);
    return { yLo: lo - pad, yHi: hi + pad };
  }, [f]);

  const sx = (x: number) => ((x + X_RANGE) / (2 * X_RANGE)) * W1;
  const sy = (y: number) => H1 - ((y - yLo) / (yHi - yLo)) * H1;

  const slope = deriv(f, x0);
  const y0 = f(x0);
  const tangent = { x1: x0 - 1.6, x2: x0 + 1.6 };
  const descentDir = slope > 0 ? -1 : 1;
  const ax = sx(x0);
  const ay = sy(y0);
  const arrowEnd = sx(x0 + 0.9 * descentDir);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W1;
    onDrag(Math.max(-X_RANGE, Math.min(X_RANGE, (px / W1) * 2 * X_RANGE - X_RANGE)));
  };

  return (
    <svg
      viewBox={`0 0 ${W1} ${H1}`}
      width="100%"
      role="img"
      aria-label="1D function with tangent line"
      style={{ touchAction: "none", cursor: "crosshair", display: "block" }}
      onPointerDown={(e) => {
        dragRef.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => dragRef.current && move(e)}
      onPointerUp={() => (dragRef.current = false)}
      onPointerLeave={() => (dragRef.current = false)}
    >
      <rect x={0} y={0} width={W1} height={H1} fill="var(--paper-2)" rx={10} />
      {/* function curve */}
      <polyline
        points={Array.from({ length: 201 }, (_, i) => {
          const x = -X_RANGE + (2 * X_RANGE * i) / 200;
          return `${sx(x)},${sy(f(x))}`;
        }).join(" ")}
        fill="none"
        stroke="var(--blue)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* tangent line */}
      <line
        x1={sx(tangent.x1)}
        y1={sy(y0 + slope * (tangent.x1 - x0))}
        x2={sx(tangent.x2)}
        y2={sy(y0 + slope * (tangent.x2 - x0))}
        stroke="var(--amber-deep)"
        strokeWidth={2.6}
      />
      {/* descent direction arrow */}
      <line x1={ax} y1={ay} x2={arrowEnd} y2={ay} stroke="var(--green)" strokeWidth={3} />
      <polygon
        points={`${arrowEnd},${ay} ${arrowEnd - 9 * descentDir},${ay - 5} ${arrowEnd - 9 * descentDir},${ay + 5}`}
        fill="var(--green)"
      />
      <text x={(ax + arrowEnd) / 2} y={ay - 9} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--green)">
        downhill
      </text>
      {/* current point */}
      <circle cx={ax} cy={ay} r={8} fill="var(--amber-deep)" stroke="#fff" strokeWidth={2.4} />
      <text x={12} y={20} fontSize={12.5} fontWeight={700} fill="var(--ink)">
        slope at x₀ = {slope.toFixed(2)}
      </text>
    </svg>
  );
}

/* ---------------- 2D panel ---------------- */

const W2 = 420;
const H2 = 420;
const R2 = 3.5; // x1, x2 in [-R2, R2]
const GRID = 48;
const BANDS = 14;
const COLORS = [
  "#1d7a50", "#2c9c6a", "#5cb98a", "#8ed0ab", "#c2e6cf",
  "#eef4dd", "#fdeed2", "#f9d9a0", "#f5c06e", "#f0a94a",
  "#e98a33", "#df6b28", "#c94f24", "#a83a20"
];

function TwoDPlot({
  x1,
  x2,
  trajectory,
  onDrag
}: {
  x1: number;
  x2: number;
  trajectory: { x1: number; x2: number }[];
  onDrag: (x1: number, x2: number) => void;
}) {
  const dragRef = useRef(false);
  const sx = (v: number) => ((v + R2) / (2 * R2)) * W2;
  const sy = (v: number) => H2 - ((v + R2) / (2 * R2)) * H2;

  const cells = useMemo(() => {
    const vals: number[][] = [];
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < GRID; i++) {
      const row: number[] = [];
      for (let j = 0; j < GRID; j++) {
        const a = -R2 + (2 * R2 * (i + 0.5)) / GRID;
        const b = -R2 + (2 * R2 * (j + 0.5)) / GRID;
        const v = f2d(a, b);
        row.push(v);
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      vals.push(row);
    }
    return vals.map((row, i) =>
      row.map((v, j) => ({
        i,
        j,
        band: Math.min(BANDS - 1, Math.floor(((v - lo) / (hi - lo + 1e-9)) * BANDS))
      }))
    );
  }, []);

  const g = grad2(f2d, x1, x2);
  const gnorm = Math.hypot(g.d1, g.d2);
  const scale = gnorm > 1e-9 ? (0.35 + 0.75 * Math.min(1, gnorm)) / gnorm : 0;
  const px = sx(x1);
  const py = sy(x2);
  const gx = sx(x1 + g.d1 * scale);
  const gy = sy(x2 + g.d2 * scale);
  const dx = sx(x1 - g.d1 * scale);
  const dy = sy(x2 - g.d2 * scale);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W2;
    const my = ((e.clientY - rect.top) / rect.height) * H2;
    onDrag(
      Math.max(-R2, Math.min(R2, (mx / W2) * 2 * R2 - R2)),
      Math.max(-R2, Math.min(R2, ((H2 - my) / H2) * 2 * R2 - R2))
    );
  };

  const arrow = (x: number, y: number, color: string) => {
    const ang = Math.atan2(y - py, x - px);
    const a1 = ang + 2.6;
    const a2 = ang - 2.6;
    return (
      <>
        <line x1={px} y1={py} x2={x} y2={y} stroke={color} strokeWidth={3.4} />
        <polygon
          points={`${x},${y} ${x + 11 * Math.cos(a1)},${y + 11 * Math.sin(a1)} ${x + 11 * Math.cos(a2)},${y + 11 * Math.sin(a2)}`}
          fill={color}
        />
      </>
    );
  };

  const cw = W2 / GRID;

  return (
    <svg
      viewBox={`0 0 ${W2} ${H2}`}
      width="100%"
      role="img"
      aria-label="2D loss landscape with gradient arrows"
      style={{ touchAction: "none", cursor: "crosshair", display: "block" }}
      onPointerDown={(e) => {
        dragRef.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => dragRef.current && move(e)}
      onPointerUp={() => (dragRef.current = false)}
      onPointerLeave={() => (dragRef.current = false)}
    >
      {cells.flat().map((c) => (
        <rect
          key={`${c.i}-${c.j}`}
          x={c.i * cw}
          y={H2 - (c.j + 1) * cw}
          width={cw + 0.6}
          height={cw + 0.6}
          fill={COLORS[c.band]}
        />
      ))}
      <text x={W2 / 2} y={H2 - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)">
        x₁ →
      </text>
      <text x={12} y={H2 / 2} fontSize={12} fontWeight={700} fill="var(--ink)" transform={`rotate(-90 12 ${H2 / 2})`} textAnchor="middle">
        x₂ →
      </text>
      {trajectory.length > 1 && (
        <>
          <polyline
            points={trajectory.map((t) => `${sx(t.x1)},${sy(t.x2)}`).join(" ")}
            fill="none"
            stroke="var(--blue)"
            strokeWidth={2.2}
            strokeDasharray="1 4"
            strokeLinecap="round"
          />
          {trajectory.map((t, i) => (
            <circle
              key={i}
              cx={sx(t.x1)}
              cy={sy(t.x2)}
              r={2.6}
              fill="var(--blue)"
              opacity={0.35 + (0.65 * i) / trajectory.length}
            />
          ))}
        </>
      )}
      {gnorm > 0.01 && (
        <>
          {arrow(gx, gy, "var(--red)")}
          {arrow(dx, dy, "var(--blue)")}
          <text x={gx} y={gy - 8} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="var(--red)">
            gradient (uphill)
          </text>
          <text x={dx} y={dy + 16} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="var(--blue)">
            descent
          </text>
        </>
      )}
      <circle cx={px} cy={py} r={9} fill="var(--amber-deep)" stroke="#fff" strokeWidth={2.5} />
    </svg>
  );
}

/* ---------------- module ---------------- */

export default function GradientExplorer({ onResult, resetSignal }: ModuleComponentProps) {
  const [tab, setTab] = useState<"1d" | "2d">("1d");
  const [showHood, setShowHood] = useState(false);

  // 1D state
  const [fnId, setFnId] = useState<"easy" | "full">("full");
  const f = fnId === "easy" ? fEasy : f1d;
  const [x0, setX0] = useState(4);
  const [lr1, setLr1] = useState(0.3);
  const [steps1, setSteps1] = useState(0);

  // 2D state
  const [p2, setP2] = useState({ x1: 2.6, x2: 2.2 });
  const [lr2, setLr2] = useState(0.3);
  const [traj, setTraj] = useState<{ x1: number; x2: number }[]>([{ x1: 2.6, x2: 2.2 }]);
  const [overshoot2, setOvershoot2] = useState(false);
  const [smooth2, setSmooth2] = useState(false);
  const runRef = useRef<number | null>(null);

  const slope = deriv(f, x0);
  const g = grad2(f2d, p2.x1, p2.x2);
  const gnorm = Math.hypot(g.d1, g.d2);

  const stopRun = () => {
    if (runRef.current !== null) {
      window.clearInterval(runRef.current);
      runRef.current = null;
    }
  };

  const place1 = (x: number) => {
    setX0(x);
    setSteps1(0);
  };

  const step1 = () => {
    setX0((x) => {
      const nx = Math.max(-X_RANGE, Math.min(X_RANGE, x - lr1 * deriv(f, x)));
      return nx;
    });
    setSteps1((s) => s + 1);
  };

  const place2 = (x1: number, x2: number) => {
    stopRun();
    setP2({ x1, x2 });
    setTraj([{ x1, x2 }]);
    setSmooth2(false);
  };

  const step2 = (cur: { x1: number; x2: number }) => {
    const gg = grad2(f2d, cur.x1, cur.x2);
    const nx = {
      x1: Math.max(-R2, Math.min(R2, cur.x1 - lr2 * gg.d1)),
      x2: Math.max(-R2, Math.min(R2, cur.x2 - lr2 * gg.d2))
    };
    if (f2d(nx.x1, nx.x2) > f2d(cur.x1, cur.x2) + 1e-9) setOvershoot2(true);
    return nx;
  };

  const oneStep2 = () => {
    stopRun();
    setP2((cur) => {
      const nx = step2(cur);
      setTraj((t) => [...t.slice(-40), nx]);
      return nx;
    });
  };

  const run20 = () => {
    stopRun();
    let n = 0;
    let increased = false;
    runRef.current = window.setInterval(() => {
      setP2((cur) => {
        const before = f2d(cur.x1, cur.x2);
        const nx = step2(cur);
        if (f2d(nx.x1, nx.x2) > before + 1e-9) increased = true;
        setTraj((t) => [...t.slice(-40), nx]);
        n++;
        if (n >= 20) {
          stopRun();
          const gEnd = grad2(f2d, nx.x1, nx.x2);
          if (!increased && Math.hypot(gEnd.d1, gEnd.d2) < 0.05) setSmooth2(true);
        }
        return nx;
      });
    }, 90);
  };

  useEffect(() => stopRun, []);

  useEffect(() => {
    setTab("1d");
    setFnId("full");
    setX0(4);
    setLr1(0.3);
    setSteps1(0);
    setLr2(0.3);
    place2(2.6, 2.2);
    setOvershoot2(false);
    setShowHood(false);
  }, [resetSignal]);

  useEffect(() => {
    onResult(
      tab === "1d"
        ? `1D: x0=${x0.toFixed(2)}, slope=${slope.toFixed(2)}, steps=${steps1}`
        : `2D: (${p2.x1.toFixed(2)}, ${p2.x2.toFixed(2)}), |gradient|=${gnorm.toFixed(2)}`
    );
  }, [tab, x0, slope, steps1, p2, gnorm, onResult]);

  return (
    <div className="panel">
      <div className="controlRow" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Segmented
          ariaLabel="View"
          options={[
            { value: "1d", label: "1D: slope and tangent" },
            { value: "2d", label: "2D: gradient on a map" }
          ]}
          value={tab}
          onChange={(v) => setTab(v as "1d" | "2d")}
        />
        <span className="hintText">
          {tab === "1d"
            ? "Drag the orange point along the curve."
            : "Drag the orange point anywhere on the map."}
        </span>
      </div>

      {tab === "1d" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div className="vizStage" style={{ padding: 12, flex: "1 1 420px", width: "auto" }}>
            <OneDPlot f={f} x0={x0} onDrag={place1} />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 260 }}>
            <Segmented
              ariaLabel="Landscape"
              options={[
                { value: "easy", label: "Warm-up hill" },
                { value: "full", label: "Full landscape" }
              ]}
              value={fnId}
              onChange={(v) => {
                setFnId(v as "easy" | "full");
                setSteps1(0);
              }}
            />
            <div style={{ marginTop: 10 }}>
              <Slider label="position x₀" value={x0} min={-X_RANGE} max={X_RANGE} step={0.05} onChange={place1} format={(v) => v.toFixed(2)} />
              <Slider
                label="learning rate"
                value={lr1}
                min={0.01}
                max={1}
                step={0.01}
                onChange={setLr1}
                format={(v) => v.toFixed(2)}
                lowHint="tiny steps"
                highHint="big jumps"
              />
            </div>
            <div className="controlRow" style={{ marginTop: 10 }}>
              <span className="statPill">
                slope <span className="statValue">{slope.toFixed(2)}</span>
              </span>
              <span className="statPill">
                steps <span className="statValue">{steps1}</span>
              </span>
            </div>
            <div className="controlRow" style={{ marginTop: 8 }}>
              <button className="btn accent small" onClick={step1}>⬇️ One descent step</button>
              <button className="btn subtle small" onClick={() => place1(4)}>↺ Reset</button>
            </div>
            <p className="hintText" style={{ marginTop: 10 }}>
              The orange line is the tangent: the local slope. A descent step moves x₀ by
              −(learning rate × slope), so it always goes downhill... if the step is not too big.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div className="vizStage" style={{ padding: 12, flex: "1 1 380px", width: "auto", maxWidth: 520 }}>
            <TwoDPlot x1={p2.x1} x2={p2.x2} trajectory={traj} onDrag={place2} />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 260 }}>
            <div className="controlRow">
              <span className="statPill">
                f(x₁, x₂) <span className="statValue">{f2d(p2.x1, p2.x2).toFixed(3)}</span>
              </span>
            </div>
            <div className="controlRow" style={{ marginTop: 6 }}>
              <span className="statPill">
                ∂f/∂x₁ <span className="statValue">{g.d1.toFixed(2)}</span>
              </span>
              <span className="statPill">
                ∂f/∂x₂ <span className="statValue">{g.d2.toFixed(2)}</span>
              </span>
              <span className="statPill">
                |gradient| <span className="statValue">{gnorm.toFixed(2)}</span>
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <Slider
                label="learning rate"
                value={lr2}
                min={0.01}
                max={3}
                step={0.01}
                onChange={setLr2}
                format={(v) => v.toFixed(2)}
                lowHint="careful"
                highHint="reckless"
              />
            </div>
            <div className="controlRow" style={{ marginTop: 8 }}>
              <button className="btn accent small" onClick={oneStep2}>⬇️ One descent step</button>
              <button className="btn accent small" onClick={run20}>▶ Run 20 steps</button>
              <button className="btn subtle small" onClick={() => place2(2.6, 2.2)}>↺ Reset</button>
            </div>
            <p className="hintText" style={{ marginTop: 10 }}>
              The red arrow is the gradient: it points uphill, and it is long where the landscape
              is steep. Gradient descent moves against it, into the green valley.
            </p>
          </div>
        </div>
      )}

      <hr className="divider" />
      <div className="panelTitle">Challenges</div>
      {tab === "1d" ? (
        <ChallengeCards
          challenges={[
            {
              id: "flat-spot",
              title: "Find a flat spot",
              goal: "Drag the point until the slope is almost zero (between -0.05 and 0.05).",
              done: Math.abs(slope) < 0.05
            },
            {
              id: "two-directions",
              title: "Both directions",
              goal: "Find a point where moving RIGHT goes downhill, then one where moving LEFT goes downhill. What is the sign of the slope in each case?"
            },
            {
              id: "walk-down",
              title: "Walk into a valley",
              goal: "From the reset position, use only descent steps to reach a flat point (at least 3 steps, final slope near zero).",
              done: steps1 >= 3 && Math.abs(slope) < 0.05
            },
            {
              id: "overshoot-1d",
              title: "Overshoot!",
              goal: "Set the learning rate near 1 on the warm-up hill and take steps near the steep part. Does the point ever jump across the valley?"
            }
          ]}
        />
      ) : (
        <ChallengeCards
          challenges={[
            {
              id: "steep",
              title: "Feel the steepness",
              goal: "Place the point where the gradient is long (|gradient| above 0.5).",
              done: gnorm > 0.5
            },
            {
              id: "flat-2d",
              title: "Find the flats",
              goal: "Place the point where the gradient almost vanishes (|gradient| below 0.05).",
              done: gnorm < 0.05
            },
            {
              id: "smooth-descent",
              title: "Smooth landing",
              goal: "Pick a learning rate that reaches a flat valley point in 20 steps without the loss ever going up.",
              done: smooth2
            },
            {
              id: "overshoot-2d",
              title: "Cause an overshoot",
              goal: "Crank the learning rate up and take steps: make the function value INCREASE on a step.",
              done: overshoot2
            }
          ]}
        />
      )}

      <hr className="divider" />
      <button className="btn subtle small" onClick={() => setShowHood((s) => !s)}>
        {showHood ? "Close" : "🔧 Under the hood"}
      </button>
      {showHood && (
        <p className="hintText fadeIn" style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 13.5 }}>
          slope(x) ≈ (f(x+ε) − f(x−ε)) / 2ε with ε = 0.001 &nbsp;·&nbsp; descent step: x ← x − η·slope
          &nbsp;·&nbsp; in 2D the gradient is the vector of both partial slopes and descent moves
          against it. Landscapes from the course notebook slopes.nb.
        </p>
      )}
    </div>
  );
}

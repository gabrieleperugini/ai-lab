type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  lowHint?: string;
  highHint?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  lowHint,
  highHint
}: SliderProps) {
  return (
    <div className="sliderControl">
      <div className="sliderHead">
        <span>{label}</span>
        <span className="sliderValue">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(lowHint || highHint) && (
        <div className="sliderHint">
          <span>{lowHint}</span>
          <span>{highHint}</span>
        </div>
      )}
    </div>
  );
}

'use client'

export default function WhatIfSlider({
  label,
  subtext,
  min,
  max,
  step,
  value,
  onChange,
  displayValue,
  accentColor
}) {
  return (
    <div className="bg-card border border-border-dark rounded-xl p-6 flex flex-col gap-6">
       {/* Inject dynamic styles for this slider instance based on accentColor */}
       <style>{`
          .slider-${label.replace(/\s+/g, '-')} {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: #0a0a0a;
            border-radius: 4px;
            outline: none;
          }
          .slider-${label.replace(/\s+/g, '-')}::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${accentColor};
            cursor: pointer;
            transition: transform 0.1s;
          }
          .slider-${label.replace(/\s+/g, '-')}::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
       `}</style>
       
       <div>
         <h3 className="text-primary font-bold leading-tight text-lg">{label}</h3>
         {subtext && <p className="text-[#6b7280] text-sm mt-1">{subtext}</p>}
       </div>

       <div className="flex flex-col gap-3">
         <div className="flex justify-between items-center font-bold">
           <span className="text-[#6b7280] text-xs">0</span>
           <span style={{ color: accentColor }} className="text-xl tracking-tight">{displayValue}</span>
           <span className="text-[#6b7280] text-xs">{max.toLocaleString('en-IN')}</span>
         </div>
         
         <input 
           type="range"
           min={min}
           max={max}
           step={step}
           value={value}
           onChange={(e) => onChange(Number(e.target.value))}
           className={`slider-${label.replace(/\s+/g, '-')}`}
           style={{
             background: `linear-gradient(to right, ${accentColor} ${(value / Math.max(max, 1)) * 100}%, #1f2b1f ${(value / Math.max(max, 1)) * 100}%)`
           }}
         />
       </div>
    </div>
  )
}

import { mmss } from '@/shared/lib/format'

interface TimeSliderProps {
  minute: number
  maxMinute: number
  onChange: (minute: number) => void
  live: boolean
}

export function TimeSlider({ minute, maxMinute, onChange, live }: TimeSliderProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[40] border-t border-line bg-bg/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1320px] items-center gap-4 px-6 py-3">
        <span className="num w-14 shrink-0 text-[13px] text-ink">{live ? 'итог' : mmss(minute * 60)}</span>
        <input
          type="range"
          min={0}
          max={maxMinute}
          value={Math.min(minute, maxMinute)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-accent"
        />
        <button
          type="button"
          onClick={() => onChange(maxMinute)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
            live ? 'border-accent/40 bg-accent/12 text-ink' : 'border-line-2 text-ink-2 hover:border-accent/40'
          }`}
        >
          К итогу
        </button>
      </div>
    </div>
  )
}

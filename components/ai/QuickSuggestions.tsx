"use client";

const SUGGESTIONS = [
  "Quanto custa?",
  "Cuidados pós-tattoo",
  "Horário de funcionamento",
  "Como agendar?",
  "Vocês aceitam walk-in?",
];

export function QuickSuggestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="label-mono border border-line px-3 py-2 text-[10px] hover:border-line-accent"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

"use client";

export function ControlPanel({
  opacity,
  rotation,
  scale,
  flip,
  onOpacity,
  onRotation,
  onScale,
  onFlip,
  onResetBody,
}: {
  opacity: number;
  rotation: number;
  scale: number;
  flip: boolean;
  onOpacity: (n: number) => void;
  onRotation: (n: number) => void;
  onScale: (n: number) => void;
  onFlip: () => void;
  onResetBody: () => void;
}) {
  return (
    <div className="space-y-4 border border-line p-4">
      <p className="label-mono">Controles</p>
      <label className="block text-sm">
        Opacidade {Math.round(opacity * 100)}%
        <input
          type="range"
          min={0.4}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(e) => onOpacity(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>
      <label className="block text-sm">
        Rotação {rotation}°
        <input
          type="range"
          min={-180}
          max={180}
          value={rotation}
          onChange={(e) => onRotation(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>
      <label className="block text-sm">
        Escala {scale.toFixed(2)}
        <input
          type="range"
          min={0.4}
          max={2.4}
          step={0.01}
          value={scale}
          onChange={(e) => onScale(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>
      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" onClick={onFlip} className="border border-line px-3 py-2">
          {flip ? "Desvirar" : "Espelhar"}
        </button>
        <button type="button" onClick={onResetBody} className="border border-line px-3 py-2">
          Trocar foto
        </button>
      </div>
    </div>
  );
}

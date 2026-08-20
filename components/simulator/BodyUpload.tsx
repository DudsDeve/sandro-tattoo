"use client";

export function BodyUpload({ onFile }: { onFile: (src: string) => void }) {
  return (
    <label className="flex h-full min-h-[60vh] cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="label-mono">Foto do corpo</p>
      <p className="font-display text-3xl">Solte uma foto aqui</p>
      <p className="max-w-sm text-sm text-ink-secondary">
        JPG ou PNG da região que você quer tatuar. A foto não sai do seu navegador.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFile(URL.createObjectURL(file));
        }}
      />
    </label>
  );
}

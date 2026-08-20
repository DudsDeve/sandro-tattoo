import { StudioClient } from "./StudioClient";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8 text-ink">
        <div>
          <p className="label-mono">CMS</p>
          <h1 className="font-display mt-3 text-4xl">Sanity ainda não está ligado.</h1>
          <p className="mt-4 max-w-md text-ink-secondary">
            Crie um projeto em sanity.io, copie o ID para NEXT_PUBLIC_SANITY_PROJECT_ID e recarregue /studio. O site
            público já funciona com o conteúdo local em lib/data.
          </p>
        </div>
      </div>
    );
  }

  return <StudioClient />;
}

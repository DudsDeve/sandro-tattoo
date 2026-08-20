import { CtaLink } from "@/components/ui/CursorLink";

export default function NotFound() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center px-5 text-center">
      <p className="label-mono">404</p>
      <h1 className="display-section mt-4">Essa página não existe.</h1>
      <div className="mt-10">
        <CtaLink href="/">Voltar ao estúdio</CtaLink>
      </div>
    </div>
  );
}

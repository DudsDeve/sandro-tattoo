import { redirect } from "next/navigation";

export default async function TryonConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/virtual-tryout?error=invalid_token");
  redirect(`/api/tryon-auth/confirm?token=${encodeURIComponent(token)}`);
}

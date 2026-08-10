"use server";

import { redirect } from "next/navigation";

export async function pullStatement(formData: FormData) {
  const input = formData.get("address")?.toString().trim();

  if (!input) {
    return;
  }

  redirect(`/wallet/${encodeURIComponent(input)}`);
}

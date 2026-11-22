"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// Changes some URL params and keeps the rest (search, filters, sort, page).
// The server reads the URL and sends back the matching rows.
// replace rather than push, so clicking around doesn't fill the browser history.
// While the new data loads, the current page stays on screen and isPending is true.
export function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateSearchParams(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) params.set(key, value);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return { updateSearchParams, isPending };
}

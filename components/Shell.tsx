import type { ReactNode } from "react";
import { FooterDisclaimer } from "./FooterDisclaimer";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-8 pt-10">
      <main className="flex-1">{children}</main>
      <FooterDisclaimer />
    </div>
  );
}

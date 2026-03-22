import type { ReactNode } from "react";
import { FooterDisclaimer } from "./FooterDisclaimer";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-10 pt-8 sm:px-5 sm:pt-12">
      <main className="flex-1">{children}</main>
      <FooterDisclaimer />
    </div>
  );
}

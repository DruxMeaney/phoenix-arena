"use client";

import { usePathname } from "next/navigation";
import { EmberEffect } from "@/components/ember-effect";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PhoenixGuide } from "@/components/phoenix-guide";
import { SessionKeeper } from "@/components/session-keeper";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      <SessionKeeper />
      {!isAdmin && <EmberEffect />}
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "relative z-10 min-h-dvh" : "flex-1 relative z-10 pt-14 sm:pt-16"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      <PhoenixGuide />
    </>
  );
}

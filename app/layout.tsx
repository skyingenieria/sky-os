import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PrimarySidebar from "@/components/PrimarySidebar";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKY·OS — Ingeniería estructural",
  description: "SaaS interno de cálculo estructural de Sky Ingeniería",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proyectos")
    .select("id, nombre, codigo, estado")
    .order("updated_at", { ascending: false });

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div style={{ display: "flex", minHeight: "100dvh" }}>
          <PrimarySidebar proyectos={(data as never[]) ?? []} />
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}

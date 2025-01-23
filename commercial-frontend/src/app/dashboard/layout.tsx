import type { Metadata } from "next";
import React from "react";
import { Header } from "@/components/Header/Header";
import ThemeSwitcher from "@/components/ThemeSwitch/ThemeSwitcher";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="w-screen flex items-center justify-center py-4 px-10">
        <Header />
      </div>
      <div>NAVBAR</div>
      <div>{children}</div>
      <div>
        <footer
          className={
            "min-h-[5vh] flex items-center justify-items-center justify-center"
          }
        >
          <ThemeSwitcher />
        </footer>
      </div>
    </>
  );
}

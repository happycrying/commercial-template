"use client";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import React from "react";

export default function ThemeProvider({
  children,
  ...props
}: {
  children: Readonly<React.ReactNode>;
  props: ThemeProviderProps;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

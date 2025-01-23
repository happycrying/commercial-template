"use client";
import ThemeProvider from "@/utils/providers/ThemeProvider";
import React from "react";

export default function Providers({children} : {children: Readonly<React.ReactNode>}) {
	return <ThemeProvider attribute="class"
	                      defaultTheme="system"
	                      enableSystem>
		{children}
	</ThemeProvider>;
}
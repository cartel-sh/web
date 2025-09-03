"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Web3Provider } from "./providers/web3-provider"
import { Provider as JotaiProvider } from "jotai"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </NextThemesProvider>
    </JotaiProvider>
  )
}
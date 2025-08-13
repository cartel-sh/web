"use client";

import * as React from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

type AppScrollbarsProps = {
  children: React.ReactNode;
};

export function AppScrollbars({ children }: AppScrollbarsProps) {
  return (
    <OverlayScrollbarsComponent
      element="div"
      options={{
        scrollbars: {
          theme: "os-theme-cartel",
          autoHide: "leave",
          autoHideDelay: 600,
        },
      }}
      className="h-dvh"
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}



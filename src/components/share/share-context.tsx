"use client";

import { createContext, type ReactNode, useContext } from "react";

export interface ShareCtxValue {
  description?: string;
  media?: string;
  title: string;
  url: string;
}

const ShareContext = createContext<ShareCtxValue | null>(null);

export function ShareProvider({
  value,
  children,
}: {
  value: ShareCtxValue;
  children: ReactNode;
}) {
  return (
    <ShareContext.Provider value={value}>{children}</ShareContext.Provider>
  );
}

export function useShareContext(): ShareCtxValue | null {
  return useContext(ShareContext);
}

import { createContext, useContext } from 'react';

export const S2SContext = createContext(null);

export function useS2SContext() {
  const ctx = useContext(S2SContext);
  if (!ctx) throw new Error('useS2SContext must be used inside <S2SProvider>');
  return ctx;
}

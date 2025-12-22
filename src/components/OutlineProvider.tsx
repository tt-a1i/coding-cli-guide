import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { OutlineContext, type OutlineSection } from './OutlineContext';

export function OutlineProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<OutlineSection[]>([]);

  const registerSection = useCallback((section: OutlineSection) => {
    setSections((prev) => {
      if (prev.some((s) => s.id === section.id)) return prev;
      return [...prev, section];
    });
  }, []);

  const value = useMemo(
    () => ({ sections, registerSection }),
    [sections, registerSection]
  );

  return <OutlineContext.Provider value={value}>{children}</OutlineContext.Provider>;
}


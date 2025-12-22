import { createContext, useContext } from 'react';

export interface OutlineSection {
  id: string;
  title: string;
}

interface OutlineContextValue {
  sections: OutlineSection[];
  registerSection: (section: OutlineSection) => void;
}

export const OutlineContext = createContext<OutlineContextValue | null>(null);

export function useOutline() {
  return useContext(OutlineContext);
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

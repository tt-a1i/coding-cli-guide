import { createContext, useContext } from 'react';

export interface NavigationContextValue {
  navigate: (tabId: string, opts?: { replace?: boolean; preserveHash?: boolean }) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

/**
 * Hook to access the navigation function from any page component.
 *
 * @example
 * ```tsx
 * const { navigate } = useNavigation();
 * // Navigate to another page
 * navigate('token-accounting');
 * ```
 */
export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationContext.Provider');
  }
  return ctx;
}

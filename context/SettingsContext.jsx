import { Colors, deriveAccentColors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "galaea/settings/v1";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [accent, setAccent] = useState(Colors.accent);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const stored = JSON.parse(raw);
        if (stored?.accent) setAccent(stored.accent);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accent })).catch(
      () => {},
    );
  }, [ready, accent]);

  const accentColors = useMemo(() => deriveAccentColors(accent), [accent]);

  const value = useMemo(
    () => ({ accent, setAccent, ...accentColors }),
    [accent, accentColors],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}

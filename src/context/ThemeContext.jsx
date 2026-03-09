import { createContext, useContext, useEffect, useState } from "react";
import { UserSettings } from "../services/apiService";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const data = await UserSettings.get();

        if (data) {
          setDarkMode(Boolean(data.dark_mode));
        }
      } catch (err) {
        console.error("Error loading theme:", err);
      } finally {
        setReady(true);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const updateDarkMode = async (value) => {
    setDarkMode(value);
    await UserSettings.update({ dark_mode: value });
  };

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, updateDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}

import { useEffect, useState } from "react";

export function useTheme(key = "theme", defaultTheme = "dark") {
  const [theme, setTheme] = useState<"light" | "dark">();

  useEffect(() => {
    const storedTheme = localStorage.getItem(key) as "light" | "dark" | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(storedTheme);
    } else {
      document.documentElement.classList.add(defaultTheme);
    }
  }, [key, defaultTheme]);

  const updateTheme = (newTheme: "light" | "dark") => {
    localStorage.setItem(key, newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    updateTheme(newTheme);
  };

  return { theme, setTheme: updateTheme, toggleTheme };
}

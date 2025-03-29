import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const DarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to light
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-50 shadow-md"
      style={{ pointerEvents: "auto" }}
    >
      <button
        onClick={toggleDarkMode}
        className={`flex items-center justify-center p-3 rounded-md transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default DarkMode;
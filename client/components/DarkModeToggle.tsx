import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useDarkMode } from "../hooks/use-dark-mode";

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDarkMode}
        className="gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <>
            <Sun className="h-4 w-4" />
            Light
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            Dark
          </>
        )}
      </Button>
    </div>
  );
}

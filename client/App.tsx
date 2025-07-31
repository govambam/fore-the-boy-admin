import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Scorecard } from "./pages/Scorecard";
import { HoleEdit } from "./pages/HoleEdit";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { supabase } from "./lib/supabase";
import { DarkModeProvider } from "./hooks/use-dark-mode";
import "./global.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = localStorage.getItem("golfTournamentSession");

        if (sessionData) {
          const session = JSON.parse(sessionData);
          const currentTime = Date.now();

          // Check if session is valid and not expired
          if (session.authenticated && session.expires > currentTime) {
            setIsAuthenticated(true);
          } else {
            // Session expired, remove it
            localStorage.removeItem("golfTournamentSession");
          }
        }
      } catch (error) {
        console.error("Error during session recovery:", error);
        // Clear invalid session data
        localStorage.removeItem("golfTournamentSession");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (password: string) => {
    try {
      if (password === "Trigga") {
        // Store authentication state in localStorage with session-like behavior
        const authSession = {
          authenticated: true,
          timestamp: Date.now(),
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        localStorage.setItem(
          "golfTournamentSession",
          JSON.stringify(authSession),
        );
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("golfTournamentSession");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <DarkModeProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600 dark:bg-green-500 rounded-full">
                <svg
                  className="h-8 w-8 text-white animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 4h14v2H5V4zm0 4h14v2H5V8zm0 4h14v2H5v-2zm0 4h14v2H5v-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Fore the Boy
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Loading tournament...
            </p>
          </div>
        </div>
      </DarkModeProvider>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <DarkModeProvider>
        <Login onLogin={handleLogin} />
      </DarkModeProvider>
    );
  }

  // Show main app if authenticated
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
          <Routes>
            <Route path="/" element={<Home onLogout={handleLogout} />} />
            <Route path="/scorecard/:round" element={<Scorecard />} />
            <Route path="/hole/:round/:hole" element={<HoleEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster theme="system" />
        </div>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;

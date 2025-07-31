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
import "./global.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing Supabase session on app load
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        } else if (session) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error during session recovery:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (password: string) => {
    try {
      if (password === "Trigga") {
        // Store authentication state in localStorage with session-like behavior
        const authSession = {
          authenticated: true,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem("golfTournamentSession", JSON.stringify(authSession));
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: "Incorrect password. Please try again." };
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <svg className="h-8 w-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4h14v2H5V4zm0 4h14v2H5V8zm0 4h14v2H5v-2zm0 4h14v2H5v-2z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Fore the Boy</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-gray-600 mt-2">Loading tournament...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Routes>
          <Route path="/" element={<Home onLogout={handleLogout} />} />
          <Route path="/scorecard/:round" element={<Scorecard />} />
          <Route path="/hole/:round/:hole" element={<HoleEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;

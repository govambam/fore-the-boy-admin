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
      // Use a custom auth approach with the hardcoded password
      if (password === "Trigga") {
        // Create a custom session by signing in with a dummy email
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@foretheboy.com',
          password: 'Trigga123!' // We'll need to create this user in Supabase
        });

        if (error) {
          // Fallback to creating the user if it doesn't exist
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@foretheboy.com',
            password: 'Trigga123!'
          });

          if (!signUpError) {
            // Now sign in
            await supabase.auth.signInWithPassword({
              email: 'admin@foretheboy.com',
              password: 'Trigga123!'
            });
          }
        }

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
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading screen briefly while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Scorecard } from "./pages/Scorecard";
import { HoleEdit } from "./pages/HoleEdit";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import "./global.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const authStatus = localStorage.getItem("golfTournamentAuth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("golfTournamentAuth", "authenticated");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("golfTournamentAuth");
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

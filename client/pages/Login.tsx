import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Trophy, AlertCircle } from "lucide-react";


interface LoginProps {
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await onLogin(password);

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        setPassword("");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Dark mode toggle in top right */}
        <div className="flex justify-end mb-4">
          <DarkModeToggle />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F8c34f0d0a3de41e1a3ea5bdb8f56cf8c%2F2ce88ead0e884635bc591c43e8b78e7e"
                alt="Fore the Boy Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Fore the Boy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Score Entry System
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Admin Access Required
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-2 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900 dark:text-gray-100">
              Enter Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-lg py-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-lg"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? "Checking..." : "Enter"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Secure Admin Login
          </p>
        </div>
      </div>
    </div>
  );
}

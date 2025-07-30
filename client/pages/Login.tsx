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
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      if (password === "Trigga") {
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Fore the Boy</h1>
          </div>
          <p className="text-gray-600 text-lg">Score Entry System</p>
          <p className="text-sm text-gray-500 mt-2">Admin Access Required</p>
        </div>

        {/* Login Form */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">
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
                  className="text-center text-lg py-3"
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
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
          <p className="text-xs text-gray-400">Secure Admin Login</p>
        </div>
      </div>
    </div>
  );
}

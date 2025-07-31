import { Link } from "react-router-dom";
import { ROUNDS } from "../lib/supabase";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, Trophy, LogOut } from "lucide-react";

interface HomeProps {
  onLogout: () => void;
}

export function Home({ onLogout }: HomeProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Logout button in top left */}
      <div className="flex justify-start mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

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
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>Ivan • Patrick • Jack • Marshall</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Select Round
        </h2>

        {ROUNDS.map((round, index) => (
          <Card
            key={round.name}
            className="hover:shadow-lg transition-all border-2 hover:border-green-200 dark:hover:border-green-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <CardContent className="p-6">
              <Link to={`/scorecard/${encodeURIComponent(round.name)}`}>
                <Button
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full">
                        <span className="text-green-700 dark:text-green-300 font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {round.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {round.holes} holes
                          {round.name === "Quicksands" && (
                            <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              Team Scramble
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {round.name !== "Quicksands" && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          <Trophy className="h-3 w-3" />
                          <span>Contests</span>
                        </div>
                      )}
                      <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center space-y-3">
        <a
          href="https://www.foretheboy.com/leaderboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm transition-colors"
        >
          <Trophy className="h-4 w-4" />
          View the Leaderboard
        </a>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Admin Score Entry System
        </p>
      </div>
    </div>
  );
}

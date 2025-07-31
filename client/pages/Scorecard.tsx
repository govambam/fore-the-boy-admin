import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  supabase,
  PLAYERS,
  ROUNDS,
  CONTEST_HOLES,
  PAR_SCORES,
  Score,
  Contest,
  Round,
  Player,
} from "../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Trophy, Target } from "lucide-react";
import { cn } from "../lib/utils";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { ContestType } from "../components/SafeEmoji";

export function Scorecard() {
  const { round } = useParams<{ round: string }>();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [contests, setContests] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const currentRound = ROUNDS.find(
    (r) => r.name === decodeURIComponent(round || ""),
  );

  if (!currentRound) {
    return <div>Round not found</div>;
  }

  const roundName = currentRound.name as Round;
  const holes = Array.from({ length: currentRound.holes }, (_, i) => i + 1);
  const contestHoles = CONTEST_HOLES[roundName];

  useEffect(() => {
    loadData();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [round]);

  // Also refresh data when component becomes visible (e.g., returning from hole edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also listen for focus events to refresh when returning to the tab
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load scores with timeout
      const { data: scoresData, error: scoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("round", roundName);

      if (scoresError) {
        console.error("Error loading scores:", scoresError);
      }

      // Load contests with timeout
      const { data: contestsData, error: contestsError } = await supabase
        .from("contests")
        .select("*")
        .eq("round", roundName);

      if (contestsError) {
        console.error("Error loading contests:", contestsError);
      }

      // Process scores
      const scoresMap: Record<string, number> = {};
      scoresData?.forEach((score) => {
        const key = `${score.player_name}-${score.hole_number}`;
        scoresMap[key] = score.strokes;
      });

      // Process contests
      const contestsMap: Record<number, string> = {};
      contestsData?.forEach((contest) => {
        contestsMap[contest.hole_number] = contest.winner_name;
      });

      setScores(scoresMap);
      setContests(contestsMap);
    } catch (error) {
      console.error("Error loading data:", error);
      // Continue loading the UI even if database connection fails
    } finally {
      setLoading(false);
    }
  };

  const getScore = (player: Player, hole: number) => {
    const key = `${player}-${hole}`;
    return scores[key] || null;
  };

  const getTeamScore = (teamLead: Player, hole: number) => {
    const key = `${teamLead}-${hole}`;
    return scores[key] || null;
  };

  const isQuicksands = roundName === "Quicksands";
  const teams = [
    { name: "Team 1", players: "IG + JC", lead: "Ivan" as Player },
    {
      name: "Team 2",
      players: "PT + MR",
      lead: "Patrick" as Player,
    },
  ];

  const hasContest = (hole: number) => {
    return (
      contestHoles.longDrive.includes(hole) ||
      contestHoles.closestToPin.includes(hole)
    );
  };

  const getContestType = (
    hole: number,
  ): "longDrive" | "closestToPin" | null => {
    if (contestHoles.longDrive.includes(hole)) return "longDrive";
    if (contestHoles.closestToPin.includes(hole)) return "closestToPin";
    return null;
  };

  const getContestWinner = (hole: number) => {
    return contests[hole] || null;
  };

  const getPar = (hole: number) => {
    return PAR_SCORES[roundName]?.[hole] || 3;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {roundName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {currentRound.holes} Holes
            </p>
          </div>
        </div>
        <DarkModeToggle />
      </div>

      {/* Mobile view (stacked cards) */}
      <div className="lg:hidden space-y-4">
        {holes.map((hole) => (
          <Card
            key={hole}
            className="border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                    Hole {hole}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    <span>Par {getPar(hole)}</span>
                  </div>
                </div>
                {hasContest(hole) && getContestType(hole) && (
                  <div className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                    <ContestType
                      type={getContestType(hole)!}
                      emojiOnly
                      className="text-xs"
                    />
                    <span>
                      {getContestType(hole) === "longDrive"
                        ? "Long Drive"
                        : "Closest to Pin"}
                    </span>
                  </div>
                )}
              </div>
              {getContestWinner(hole) && (
                <div className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-1 rounded inline-block w-fit">
                  Winner: {getContestWinner(hole)}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isQuicksands ? (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <Link
                      key={team.name}
                      to={`/hole/${encodeURIComponent(roundName)}/${hole}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div>
                          <span className="font-medium text-sm block text-gray-900 dark:text-gray-100">
                            {team.name}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {team.players}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                            getTeamScore(team.lead, hole)
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400",
                          )}
                        >
                          {getTeamScore(team.lead, hole) || "–"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {PLAYERS.map((player) => (
                    <Link
                      key={player}
                      to={`/hole/${encodeURIComponent(roundName)}/${hole}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {player}
                        </span>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                            getScore(player, hole)
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400",
                          )}
                        >
                          {getScore(player, hole) || "–"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view (grid) */}
      <div className="hidden lg:block">
        <Card className="border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 bg-gray-50 dark:bg-gray-700">
                    <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                      {isQuicksands ? "Team" : "Player"}
                    </th>
                    {holes.map((hole) => (
                      <th key={hole} className="p-3 text-center min-w-[60px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {hole}
                          </span>
                          {hasContest(hole) && getContestType(hole) && (
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              <ContestType
                                type={getContestType(hole)!}
                                emojiOnly
                                className="text-xs"
                              />
                            </div>
                          )}
                          {getContestWinner(hole) && (
                            <div className="text-[10px] text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-1 rounded">
                              {getContestWinner(hole)}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Par row */}
                  <tr className="border-b-2 bg-blue-50 dark:bg-blue-900">
                    <td className="p-4 font-semibold text-blue-700 dark:text-blue-300 sticky left-0 bg-blue-50 dark:bg-blue-900 z-10">
                      Par
                    </td>
                    {holes.map((hole) => (
                      <td key={hole} className="p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-semibold flex items-center justify-center text-sm">
                          {getPar(hole)}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {isQuicksands
                    ? teams.map((team) => (
                        <tr
                          key={team.name}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                        >
                          <td className="p-4 font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800">
                            <div>
                              <div className="font-semibold">{team.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {team.players}
                              </div>
                            </div>
                          </td>
                          {holes.map((hole) => (
                            <td key={hole} className="p-3 text-center">
                              <Link
                                to={`/hole/${encodeURIComponent(roundName)}/${hole}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-10 h-10 rounded-full font-semibold",
                                    getTeamScore(team.lead, hole)
                                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                                      : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500",
                                  )}
                                >
                                  {getTeamScore(team.lead, hole) || "–"}
                                </Button>
                              </Link>
                            </td>
                          ))}
                        </tr>
                      ))
                    : PLAYERS.map((player) => (
                        <tr
                          key={player}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                        >
                          <td className="p-4 font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800">
                            {player}
                          </td>
                          {holes.map((hole) => (
                            <td key={hole} className="p-3 text-center">
                              <Link
                                to={`/hole/${encodeURIComponent(roundName)}/${hole}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-10 h-10 rounded-full font-semibold",
                                    getScore(player, hole)
                                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                                      : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500",
                                  )}
                                >
                                  {getScore(player, hole) || "–"}
                                </Button>
                              </Link>
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  supabase,
  PLAYERS,
  CONTEST_HOLES,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";

export function HoleEdit() {
  const { round, hole } = useParams<{ round: string; hole: string }>();
  const navigate = useNavigate();

  const [scores, setScores] = useState<Record<Player, string>>({
    Ivan: "-",
    Patrick: "-",
    Jack: "-",
    Marshall: "-",
  });
  const [teamScores, setTeamScores] = useState<Record<string, string>>({
    "Team 1": "-",
    "Team 2": "-",
  });
  const [contestWinner, setContestWinner] = useState<string>("-");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roundName = decodeURIComponent(round || "") as Round;
  const holeNumber = parseInt(hole || "0");

  const contestHoles = CONTEST_HOLES[roundName];
  const hasContest =
    contestHoles.longDrive.includes(holeNumber) ||
    contestHoles.closestToPin.includes(holeNumber);
  const contestType = contestHoles.longDrive.includes(holeNumber)
    ? "���� Long Drive"
    : "🎯 Closest to the Pin";

  const isQuicksands = roundName === "Quicksands";
  const teams = [
    { name: "Team 1", players: "Ivan + Jack", lead: "Ivan" as Player },
    {
      name: "Team 2",
      players: "Patrick + Marshall",
      lead: "Patrick" as Player,
    },
  ];

  useEffect(() => {
    loadHoleData();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [round, hole]);

  const loadHoleData = async () => {
    setLoading(true);
    try {
      // Load existing scores for this hole
      const { data: scoresData } = await supabase
        .from("scores")
        .select("*")
        .eq("round", roundName)
        .eq("hole_number", holeNumber);

      // Load existing contest data for this hole
      const { data: contestData } = await supabase
        .from("contests")
        .select("*")
        .eq("round", roundName)
        .eq("hole_number", holeNumber)
        .single();

      // Populate scores
      const newScores = { ...scores };
      const newTeamScores = { ...teamScores };

      scoresData?.forEach((score) => {
        if (isQuicksands) {
          // For Quicksands, map player names to team scores
          if (score.player_name === "Ivan") {
            newTeamScores["Team 1"] = score.strokes.toString();
          } else if (score.player_name === "Patrick") {
            newTeamScores["Team 2"] = score.strokes.toString();
          }
        } else {
          newScores[score.player_name as Player] = score.strokes.toString();
        }
      });

      setScores(newScores);
      setTeamScores(newTeamScores);

      // Populate contest winner
      if (contestData) {
        setContestWinner(contestData.winner_name);
      }
    } catch (error) {
      console.error("Error loading hole data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (player: Player, value: string) => {
    setScores((prev) => ({ ...prev, [player]: value }));
  };

  const handleTeamScoreChange = (team: string, value: string) => {
    setTeamScores((prev) => ({ ...prev, [team]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing scores for this hole
      await supabase
        .from("scores")
        .delete()
        .eq("round", roundName)
        .eq("hole_number", holeNumber);

      // Delete existing contest for this hole
      await supabase
        .from("contests")
        .delete()
        .eq("round", roundName)
        .eq("hole_number", holeNumber);

      // Insert new scores
      let scoresToInsert = [];

      if (isQuicksands) {
        // For Quicksands, save team scores using team lead players
        teams.forEach((team) => {
          const teamScore = teamScores[team.name];
          if (teamScore !== "-" && teamScore !== "") {
            scoresToInsert.push({
              player_name: team.lead,
              round: roundName,
              hole_number: holeNumber,
              strokes: parseInt(teamScore),
            });
          }
        });
      } else {
        // For other rounds, save individual player scores
        scoresToInsert = PLAYERS.filter(
          (player) => scores[player] !== "-" && scores[player] !== "",
        ).map((player) => ({
          player_name: player,
          round: roundName,
          hole_number: holeNumber,
          strokes: parseInt(scores[player]),
        }));
      }

      if (scoresToInsert.length > 0) {
        const { error: scoresError } = await supabase
          .from("scores")
          .insert(scoresToInsert);

        if (scoresError) throw scoresError;
      }

      // Insert contest winner (only if not "-")
      if (hasContest && contestWinner !== "-" && contestWinner !== "") {
        const { error: contestError } = await supabase.from("contests").insert({
          round: roundName,
          hole_number: holeNumber,
          winner_name: contestWinner,
        });

        if (contestError) throw contestError;
      }

      toast.success("Hole data saved successfully!");
      navigate(`/scorecard/${encodeURIComponent(roundName)}`);
    } catch (error) {
      console.error("Error saving hole data:", error);
      toast.error("Failed to save hole data");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/scorecard/${encodeURIComponent(roundName)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/scorecard/${encodeURIComponent(roundName)}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {roundName} - Hole {holeNumber}
          </h1>
          {hasContest && (
            <p className="text-orange-600 font-medium">{contestType}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Scores */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isQuicksands ? "Team Scores" : "Player Scores"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isQuicksands
              ? teams.map((team) => (
                  <div
                    key={team.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <label className="font-medium text-gray-900 block">
                        {team.name}
                      </label>
                      <span className="text-sm text-gray-600">
                        {team.players}
                      </span>
                    </div>
                    <Select
                      value={teamScores[team.name]}
                      onValueChange={(value) =>
                        handleTeamScoreChange(team.name, value)
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">–</SelectItem>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              : PLAYERS.map((player) => (
                  <div
                    key={player}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <label className="font-medium text-gray-900">
                      {player}
                    </label>
                    <Select
                      value={scores[player]}
                      onValueChange={(value) =>
                        handleScoreChange(player, value)
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">–</SelectItem>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
          </CardContent>
        </Card>

        {/* Contest Selection */}
        {hasContest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {contestType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <label className="font-medium text-gray-900">Winner</label>
                <Select value={contestWinner} onValueChange={setContestWinner}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">–</SelectItem>
                    {PLAYERS.map((player) => (
                      <SelectItem key={player} value={player}>
                        {player}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

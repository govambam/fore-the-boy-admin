import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  supabase,
  PLAYERS,
  CONTEST_HOLES,
  PAR_SCORES,
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
import { ArrowLeft, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

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
  const [clearing, setClearing] = useState(false);

  const roundName = decodeURIComponent(round || "") as Round;
  const holeNumber = parseInt(hole || "0");

  const contestHoles = CONTEST_HOLES[roundName];
  const hasContest =
    contestHoles.longDrive.includes(holeNumber) ||
    contestHoles.closestToPin.includes(holeNumber);
  const contestType = contestHoles.longDrive.includes(holeNumber)
    ? "🏌 Long Drive"
    : "🎯 Closest to the Pin";

  const isQuicksands = roundName === "Quicksands";
  const teams = [
    { name: "Team 1", players: "IG + JC", lead: "Ivan" as Player },
    {
      name: "Team 2",
      players: "PT + MR",
      lead: "Patrick" as Player,
    },
  ];

  const getPar = () => {
    return PAR_SCORES[roundName]?.[holeNumber] || 3;
  };

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

      // Start with fresh state - all scores set to "-"
      const newScores: Record<Player, string> = {
        Ivan: "-",
        Patrick: "-",
        Jack: "-",
        Marshall: "-",
      };
      const newTeamScores: Record<string, string> = {
        "Team 1": "-",
        "Team 2": "-",
      };

      // Only populate scores that exist in the database
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

  const generateUniqueHoleId = (playerName: string, round: string, holeNumber: number) => {
    return `${playerName}-${round}-${holeNumber}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Starting save for hole", holeNumber, "in round", roundName);
      console.log("Current scores:", isQuicksands ? teamScores : scores);

      // Prepare scores to upsert and scores to delete
      let scoresToUpsert = [];
      let scoresToDelete = [];
      let deletedScores = 0;

      if (isQuicksands) {
        // For Quicksands, save team scores using team lead players
        teams.forEach((team) => {
          const teamScore = teamScores[team.name];
          const uniqueHoleId = generateUniqueHoleId(team.lead, roundName, holeNumber);

          if (teamScore !== "-" && teamScore !== "") {
            scoresToUpsert.push({
              player_name: team.lead,
              round: roundName,
              hole_number: holeNumber,
              strokes: parseInt(teamScore),
              unique_hole_id: uniqueHoleId,
            });
          } else if (teamScore === "-") {
            scoresToDelete.push(uniqueHoleId);
            deletedScores++;
          }
        });
      } else {
        // For other rounds, save individual player scores
        PLAYERS.forEach((player) => {
          const playerScore = scores[player];
          const uniqueHoleId = generateUniqueHoleId(player, roundName, holeNumber);

          if (playerScore !== "-" && playerScore !== "") {
            scoresToUpsert.push({
              player_name: player,
              round: roundName,
              hole_number: holeNumber,
              strokes: parseInt(playerScore),
              unique_hole_id: uniqueHoleId,
            });
          } else if (playerScore === "-") {
            scoresToDelete.push(uniqueHoleId);
            deletedScores++;
          }
        });
      }

      console.log("Scores to upsert:", scoresToUpsert);
      console.log("Scores to delete:", scoresToDelete);
      console.log("Deleted scores count:", deletedScores);

      // Delete scores that were cleared
      for (const uniqueHoleId of scoresToDelete) {
        const deleteResult = await supabase
          .from("scores")
          .delete()
          .eq("unique_hole_id", uniqueHoleId);

        console.log(`Delete result for ${uniqueHoleId}:`, deleteResult);

        if (deleteResult.error) {
          console.error("Delete error details:", JSON.stringify(deleteResult.error, null, 2));
          throw deleteResult.error;
        }
      }

      // Upsert scores that have values
      if (scoresToUpsert.length > 0) {
        const upsertResult = await supabase
          .from("scores")
          .upsert(scoresToUpsert, {
            onConflict: "unique_hole_id",
            ignoreDuplicates: false,
          });

        console.log("Upsert scores result:", upsertResult);

        if (upsertResult.error) {
          console.error("Upsert error details:", JSON.stringify(upsertResult.error, null, 2));
          throw upsertResult.error;
        }
      }

      // Handle contest winner (delete existing, then insert if needed)
      if (hasContest) {
        // Always delete existing contest for this hole first
        await supabase
          .from("contests")
          .delete()
          .eq("round", roundName)
          .eq("hole_number", holeNumber);

        // Insert new contest winner if not "-"
        if (contestWinner !== "-" && contestWinner !== "") {
          const { error: contestError } = await supabase
            .from("contests")
            .insert({
              round: roundName,
              hole_number: holeNumber,
              winner_name: contestWinner,
            });

          if (contestError) {
            console.error("Contest insert error details:", JSON.stringify(contestError, null, 2));
            throw contestError;
          }
        }
      }

      // Provide feedback about what was saved/deleted
      let message = "Hole data saved successfully!";
      if (deletedScores > 0 && scoresToUpsert.length > 0) {
        message = `Saved ${scoresToUpsert.length} scores and removed ${deletedScores} scores.`;
      } else if (deletedScores > 0) {
        message = `Removed ${deletedScores} scores from hole ${holeNumber}.`;
      } else if (scoresToUpsert.length > 0) {
        message = `Saved ${scoresToUpsert.length} scores for hole ${holeNumber}.`;
      }

      toast.success(message);
      navigate(`/scorecard/${encodeURIComponent(roundName)}`);
    } catch (error) {
      console.error("Error saving hole data:", JSON.stringify(error, null, 2));
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);

      let errorMessage = "Unknown error";
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error) {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else {
        errorMessage = String(error);
      }

      toast.error(`Failed to save hole data: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/scorecard/${encodeURIComponent(roundName)}`);
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      console.log("Starting clear for hole", holeNumber, "in round", roundName);

      // Generate unique_hole_ids for all players/teams and delete them
      let uniqueHoleIds = [];

      if (isQuicksands) {
        // For Quicksands, delete team lead scores
        teams.forEach((team) => {
          uniqueHoleIds.push(generateUniqueHoleId(team.lead, roundName, holeNumber));
        });
      } else {
        // For other rounds, delete all player scores
        PLAYERS.forEach((player) => {
          uniqueHoleIds.push(generateUniqueHoleId(player, roundName, holeNumber));
        });
      }

      // Delete all scores using unique_hole_id
      for (const uniqueHoleId of uniqueHoleIds) {
        const deleteResult = await supabase
          .from("scores")
          .delete()
          .eq("unique_hole_id", uniqueHoleId);

        console.log(`Delete result for ${uniqueHoleId}:`, deleteResult);
      }

      // Delete contest for this hole
      const deleteContestResult = await supabase
        .from("contests")
        .delete()
        .eq("round", roundName)
        .eq("hole_number", holeNumber);

      console.log("Delete contest result:", deleteContestResult);

      // Reset local state
      setScores({
        Ivan: "-",
        Patrick: "-",
        Jack: "-",
        Marshall: "-",
      });
      setTeamScores({
        "Team 1": "-",
        "Team 2": "-",
      });
      setContestWinner("-");

      toast.success(`Cleared all data for hole ${holeNumber}`);
      navigate(`/scorecard/${encodeURIComponent(roundName)}`);
    } catch (error) {
      console.error("Error clearing hole data:", JSON.stringify(error, null, 2));

      let errorMessage = "Unknown error";
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error) {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else {
        errorMessage = String(error);
      }

      toast.error(`Failed to clear hole data: ${errorMessage}`);
    } finally {
      setClearing(false);
    }
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
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {roundName} - Hole {holeNumber}
            </h1>
            <div className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
              <span>Par {getPar()}</span>
            </div>
          </div>
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
            disabled={saving || clearing}
            className="flex-1 gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={saving || clearing}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {clearing ? "Clearing..." : "Clear"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Hole Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all scores and contest data for
                  Hole {holeNumber} in {roundName}. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={clearing}
                >
                  {clearing ? "Clearing..." : "Clear All Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

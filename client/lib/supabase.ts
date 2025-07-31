import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eunomxuabzzfualvhrxm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bm9teHVhYnp6ZnVhbHZocnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQ0MzUsImV4cCI6MjA2OTQ4MDQzNX0.PZ90gbhUq0zWmEfI0k_X6AO9huzaTgCyV3XhHsGt98o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Score {
  player_name: string;
  round: string;
  hole_number: number;
  strokes: number;
}

export interface Contest {
  round: string;
  hole_number: number;
  winner_name: string;
}

export type Player = "Ivan" | "Patrick" | "Jack" | "Marshall";
export type Round = "Scarecrow" | "Gamble Sands" | "Quicksands";
export type ContestType = "Long Drive" | "Closest to the Pin";

// Contest configuration
export const CONTEST_HOLES: Record<
  Round,
  { longDrive: number[]; closestToPin: number[] }
> = {
  Scarecrow: {
    longDrive: [3, 6, 15],
    closestToPin: [2, 4, 9, 11, 16],
  },
  "Gamble Sands": {
    longDrive: [3, 7, 18],
    closestToPin: [4, 6, 10, 13, 16],
  },
  Quicksands: {
    longDrive: [],
    closestToPin: [],
  },
};

export const PLAYERS: Player[] = ["Ivan", "Patrick", "Jack", "Marshall"];

export const ROUNDS: { name: Round; holes: number }[] = [
  { name: "Scarecrow", holes: 18 },
  { name: "Gamble Sands", holes: 18 },
  { name: "Quicksands", holes: 14 },
];

// Par scores for each course
export const PAR_SCORES: Record<Round, Record<number, number>> = {
  "Gamble Sands": {
    1: 4, 2: 4, 3: 5, 4: 3, 5: 4, 6: 3, 7: 5, 8: 4, 9: 4,
    10: 3, 11: 4, 12: 4, 13: 5, 14: 4, 15: 4, 16: 3, 17: 4, 18: 5
  },
  "Scarecrow": {
    1: 4, 2: 3, 3: 5, 4: 3, 5: 4, 6: 5, 7: 4, 8: 4, 9: 3,
    10: 4, 11: 3, 12: 5, 13: 4, 14: 4, 15: 5, 16: 3, 17: 4, 18: 4
  },
  "Quicksands": {
    1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3,
    8: 3, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3
  }
};

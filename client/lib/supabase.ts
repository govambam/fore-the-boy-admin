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

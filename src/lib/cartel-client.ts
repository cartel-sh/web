import { CartelClient, LocalStorageTokenStorage } from "@cartel-sh/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.cartel.sh";
const API_KEY = process.env.API_KEY || "";

export const cartel = new CartelClient(
  API_URL,
  API_KEY,
  typeof window !== "undefined" ? new LocalStorageTokenStorage() : undefined
);
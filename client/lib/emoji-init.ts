/**
 * Emoji initialization script
 * Call this early in your app to warm up emoji detection cache
 */

import { preloadEmojiSupport } from "./emoji-utils";

// Initialize emoji support detection
export function initializeEmojiSupport() {
  // Only run in browser environment
  if (typeof window !== "undefined") {
    console.log("[Emoji] Initializing emoji support detection...");
    preloadEmojiSupport();
  }
}

// Auto-initialize if this module is imported
initializeEmojiSupport();

/**
 * Emoji Fallback Utility
 * Provides safe emoji rendering with fallbacks for devices/browsers that don't support certain emojis
 */

// Test if browser supports a specific emoji
function supportsEmoji(emoji: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Create a canvas to test emoji rendering
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return false;

    canvas.width = 20;
    canvas.height = 20;

    // Draw the emoji
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText(emoji, 10, 10);

    // Get image data to check if emoji was rendered properly
    const imageData = ctx.getImageData(0, 0, 20, 20);
    const data = imageData.data;

    // Check if any pixels were drawn (not all transparent)
    for (let i = 0; i < data.length; i += 4) {
      // Check alpha channel (4th value)
      if (data[i + 3] > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn("Emoji support detection failed:", error);
    return false;
  }
}

// Cache emoji support results to avoid repeated testing
const emojiSupportCache = new Map<string, boolean>();

function isEmojiSupported(emoji: string): boolean {
  if (emojiSupportCache.has(emoji)) {
    return emojiSupportCache.get(emoji)!;
  }

  const supported = supportsEmoji(emoji);
  emojiSupportCache.set(emoji, supported);
  return supported;
}

// Device/Browser detection for known emoji issues
function hasKnownEmojiIssues(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Known browsers/devices with emoji rendering issues
  const problematicPatterns = [
    /windows.*chrome.*(?:9[0-5]|8[0-9])/, // Older Chrome on Windows
    /android.*4\.[0-4]/, // Android 4.4 and below
    /msie|trident/, // Internet Explorer
    /edge\/(?:1[0-7])/, // Older Edge versions
  ];

  return problematicPatterns.some((pattern) => pattern.test(userAgent));
}

// Emoji definitions with fallbacks
export interface EmojiWithFallback {
  emoji: string;
  fallback: string;
  description: string;
}

export const GOLF_EMOJIS = {
  LONG_DRIVE: {
    emoji: "🏌",
    fallback: "⛳",
    description: "Long Drive",
  } as EmojiWithFallback,

  CLOSEST_TO_PIN: {
    emoji: "🎯",
    fallback: "🎪",
    description: "Closest to Pin",
  } as EmojiWithFallback,

  TROPHY: {
    emoji: "🏆",
    fallback: "🥇",
    description: "Trophy",
  } as EmojiWithFallback,
};

// Additional fallback options if both primary emojis fail
const SAFE_FALLBACKS = {
  LONG_DRIVE: ["⛳", "🏁", "→", "▶"],
  CLOSEST_TO_PIN: ["🎪", "⭕", "◯", "○"],
  TROPHY: ["🥇", "👑", "★", "✦"],
};

/**
 * Get a safe emoji that will render properly across devices
 */
export function getSafeEmoji(emojiDef: EmojiWithFallback): string {
  // If we know this device has emoji issues, use fallback immediately
  if (hasKnownEmojiIssues()) {
    return emojiDef.fallback;
  }

  // Test primary emoji
  if (isEmojiSupported(emojiDef.emoji)) {
    return emojiDef.emoji;
  }

  // Test fallback emoji
  if (isEmojiSupported(emojiDef.fallback)) {
    return emojiDef.fallback;
  }

  // If both fail, try additional safe fallbacks
  const safeOptions =
    SAFE_FALLBACKS[
      emojiDef.description
        .replace(" ", "_")
        .toUpperCase() as keyof typeof SAFE_FALLBACKS
    ];

  if (safeOptions) {
    for (const option of safeOptions) {
      if (isEmojiSupported(option)) {
        return option;
      }
    }
  }

  // Ultimate fallback: return empty string or simple text
  return "";
}

/**
 * Get contest type with safe emoji rendering
 */
export function getContestTypeWithEmoji(
  contestType: "longDrive" | "closestToPin",
): string {
  const config =
    contestType === "longDrive"
      ? GOLF_EMOJIS.LONG_DRIVE
      : GOLF_EMOJIS.CLOSEST_TO_PIN;
  const safeEmoji = getSafeEmoji(config);

  return safeEmoji ? `${safeEmoji} ${config.description}` : config.description;
}

/**
 * Get just the emoji part with fallback
 */
export function getContestEmoji(
  contestType: "longDrive" | "closestToPin",
): string {
  const config =
    contestType === "longDrive"
      ? GOLF_EMOJIS.LONG_DRIVE
      : GOLF_EMOJIS.CLOSEST_TO_PIN;
  return getSafeEmoji(config);
}

/**
 * Test all emojis and warm up the cache
 */
export function preloadEmojiSupport(): void {
  // Run in next tick to avoid blocking
  setTimeout(() => {
    Object.values(GOLF_EMOJIS).forEach((emojiDef) => {
      isEmojiSupported(emojiDef.emoji);
      isEmojiSupported(emojiDef.fallback);
    });

    // Test additional fallbacks
    Object.values(SAFE_FALLBACKS)
      .flat()
      .forEach((emoji) => {
        isEmojiSupported(emoji);
      });
  }, 100);
}

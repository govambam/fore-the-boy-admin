import { useEffect, useState } from "react";
import {
  getSafeEmoji,
  EmojiWithFallback,
  GOLF_EMOJIS,
} from "../lib/emoji-utils";

interface SafeEmojiProps {
  emoji: EmojiWithFallback;
  className?: string;
  fallbackMode?: "emoji" | "text" | "hidden";
}

/**
 * SafeEmoji Component
 * Renders emojis with automatic fallback handling for better cross-device compatibility
 */
export function SafeEmoji({
  emoji,
  className = "",
  fallbackMode = "emoji",
}: SafeEmojiProps) {
  const [safeEmoji, setSafeEmoji] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use timeout to avoid blocking render
    const timeoutId = setTimeout(() => {
      const result = getSafeEmoji(emoji);
      setSafeEmoji(result);
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [emoji]);

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return <span className={className} aria-label={emoji.description}></span>;
  }

  // If we have a safe emoji, render it
  if (safeEmoji) {
    return (
      <span
        className={`emoji-safe ${className}`}
        role="img"
        aria-label={emoji.description}
        title={emoji.description}
      >
        {safeEmoji}
      </span>
    );
  }

  // Fallback modes when no emoji is available
  switch (fallbackMode) {
    case "text":
      return (
        <span className={className} title={emoji.description}>
          [{emoji.description}]
        </span>
      );
    case "hidden":
      return null;
    case "emoji":
    default:
      // Last resort: try to render the original emoji anyway
      return (
        <span
          className={`emoji-fallback ${className}`}
          role="img"
          aria-label={emoji.description}
          title={emoji.description}
        >
          {emoji.emoji}
        </span>
      );
  }
}

/**
 * Contest Type Component with Safe Emoji
 */
interface ContestTypeProps {
  type: "longDrive" | "closestToPin";
  className?: string;
  showLabel?: boolean;
  emojiOnly?: boolean;
}

export function ContestType({
  type,
  className = "",
  showLabel = true,
  emojiOnly = false,
}: ContestTypeProps) {
  const emojiConfig =
    type === "longDrive" ? GOLF_EMOJIS.LONG_DRIVE : GOLF_EMOJIS.CLOSEST_TO_PIN;

  if (emojiOnly) {
    return (
      <SafeEmoji
        emoji={emojiConfig}
        className={className}
        fallbackMode="text"
      />
    );
  }

  return (
    <span className={className}>
      <SafeEmoji emoji={emojiConfig} fallbackMode="hidden" />
      {showLabel && <> {emojiConfig.description}</>}
    </span>
  );
}

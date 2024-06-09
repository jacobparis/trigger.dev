import { formatDuration } from "@trigger.dev/core/v3";

export default function AppGood() {
  return (
    <span>
      {formatDuration(new Date("2024-05-01"), new Date(), {
        style: "short",
      })}
    </span>
  );
}

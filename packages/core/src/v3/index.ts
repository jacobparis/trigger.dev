export {
  formatDuration,
  formatDurationInDays,
  formatDurationMilliseconds,
  formatDurationNanoseconds,
  millisecondsToNanoseconds,
  nanosecondsToMilliseconds,
} from "./durations";

import { castToError } from "./apiClient/core";

console.log(castToError);

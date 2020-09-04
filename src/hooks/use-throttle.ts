import { useCallback } from "react";
import throttle from "lodash.throttle";

export default function useThrottle(callback: Function, deps: any[] = []) {
  const WAIT = 500;
  const throttleSettings = { leading: true, trailing: true };
  return useCallback(throttle(callback as any, WAIT, throttleSettings), deps);
}

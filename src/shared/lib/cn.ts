/**
 * Minimal className joiner — filters out falsy values so callers can use
 * conditional expressions inline without pulling in a dependency.
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ")
}

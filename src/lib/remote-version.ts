export function needsVersionReload(current: string, remote: unknown, lastAttempt: string | null): remote is { version: string } {
  return typeof remote === 'object' && remote !== null && 'version' in remote && typeof remote.version === 'string' && remote.version !== current && remote.version !== lastAttempt;
}

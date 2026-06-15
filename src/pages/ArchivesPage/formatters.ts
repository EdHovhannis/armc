export const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) {
    return `${(bytes / 1_073_741_824).toFixed(2)} Gb`;
  }

  if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(0)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${bytes} B`;
};

export const formatSpeed = (bytesPerSec: number): string =>
  bytesPerSec >= 1_048_576 ? `${(bytesPerSec / 1_048_576).toFixed(0)} MB/s` : `${bytesPerSec} B/s`;

export const formatRetention = (seconds: number | null): string => (seconds == null ? '—' : `${Math.round(seconds / 86_400)} дней`);

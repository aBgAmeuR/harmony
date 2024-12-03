export const getMsPlayedInMinutes = (msPlayed: number | string) =>
  (Number(msPlayed) / (1000 * 60)).toFixed(2);

export const getMsPlayedInHours = (
  msPlayed: number | string,
  showDecimals = true,
) => {
  const hours = Number(msPlayed) / (1000 * 60 * 60);

  if (showDecimals) {
    return hours.toFixed(2);
  }

  return Math.floor(hours).toString();
};

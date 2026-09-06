export function catalogueWidth(requested: number, viewportWidth: number) {
  const maximum = Math.max(260, Math.min(520, viewportWidth * 0.4));
  return Math.max(260, Math.min(maximum, Number.isFinite(requested) ? requested : 320));
}

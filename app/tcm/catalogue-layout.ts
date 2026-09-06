export function catalogueWidth(requested: number, viewportWidth: number) {
  const maximum = Math.max(260, Math.min(520, viewportWidth * 0.4));
  return Math.max(260, Math.min(maximum, Number.isFinite(requested) ? requested : 320));
}

export function nextCatalogueExpansion(
  current: boolean,
  event: "toggle" | "mode-change",
) {
  return event === "mode-change" ? false : !current;
}

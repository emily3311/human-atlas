export function renderableViewport(width: number, height: number) {
  if (width <= 0 || height <= 0) return null;
  return { width, height, aspect: width / height };
}

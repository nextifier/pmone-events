/**
 * CSS aspect-ratio of an uploaded image, from the width and height the upload
 * recorded (`getMediaUrls()` on the API sends both), so a frame can take the
 * image's own shape before the file arrives and nothing moves when it does.
 * Media uploaded before the dimensions were recorded gets `fallback`.
 */
export function mediaAspectRatio(media, fallback = "1 / 1") {
  const width = Number(media?.width);
  const height = Number(media?.height);
  return width > 0 && height > 0 ? `${width} / ${height}` : fallback;
}

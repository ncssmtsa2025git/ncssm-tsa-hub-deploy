/**
 * Shrink a photo in the browser before uploading: phone photos are often 5-12 MB, the API takes at most 4 MB,
 * and the website never shows them larger than ~2000px anyway. Always returns a JPEG.
 */
export async function resizeImage(file: File, maxSide: number, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} isn't a photo`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`Couldn't read ${file.name}. Use a JPEG or PNG (iPhone HEIC photos: export as JPEG first).`);
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(`Couldn't convert ${file.name}`))), 'image/jpeg', quality)
  );
}

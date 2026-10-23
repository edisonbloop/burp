/**
 * Shrinks a photo in the browser before upload: longest edge ≤ 1600px, JPEG,
 * stepping quality down until it fits under ~700 KB (server actions cap the
 * request body at 1 MB by default).
 */
const MAX_EDGE = 1600;
const TARGET_BYTES = 700 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This photo format isn't supported — try a JPG or PNG."));
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image.");
  const img = await loadImage(file);

  let edge = MAX_EDGE;
  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const g = canvas.getContext("2d")!;
    g.fillStyle = "#fff"; // transparent PNGs would otherwise go black
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(img, 0, 0, canvas.width, canvas.height);

    const quality = attempt < 3 ? 0.86 - attempt * 0.1 : 0.7;
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= TARGET_BYTES) {
      return new File([blob], "photo.jpg", { type: "image/jpeg" });
    }
    if (attempt >= 2) edge = Math.round(edge * 0.75);
  }
  throw new Error("Couldn't shrink that photo enough — try a smaller one.");
}

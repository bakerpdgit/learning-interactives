
import imageCompression from "browser-image-compression";

export async function loadImageFile(file) {
  const maxSize = 5 * 1024 * 1024;
  const image = file.size > maxSize ? await imageCompression(file, {
    maxSizeMB: 5,
    maxWidthOrHeight: 1080,
    initialQuality: 0.7,
    fileType: "image/jpeg",
    useWebWorker: true,
  }) : file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The image couldn’t be read."));
    reader.readAsDataURL(image);
  });
}

export function handleImageFileChange(file, onLoad) {
  if (file) loadImageFile(file).then(onLoad, (error) => console.error(error));
}

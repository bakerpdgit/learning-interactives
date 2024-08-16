import imageCompression from "browser-image-compression";

const handleImageFileChange = (file, callback) => {
  const maxSize = 5 * 1024 * 1024; // 10 MB, for example

  if (file) {
    if (file.size > maxSize) {
      compressImage(file, callback);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      callback(dataUrl);
    };
    reader.readAsDataURL(file);
  }
};

const compressImage = async (imageFile, callback) => {
  const options = {
    maxSizeMB: 5, // Set the maximum size to 5MB
    maxWidthOrHeight: 1080, // Consider adjusting this value based on your needs
    quality: 0.7, // Try to keep the quality at 0.7 or higher
    fileType: "image/jpeg", // Force output to JPEG
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => {
      callback(reader.result);
    };
  } catch (error) {
    console.error(error);
  }
};

export { handleImageFileChange, compressImage };

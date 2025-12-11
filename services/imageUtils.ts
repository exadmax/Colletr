/**
 * Resizes an image file to a manageable size for LocalStorage and UI display.
 * @param file The input file from the input tag
 * @param maxWidth The maximum width for the thumbnail (default 600px)
 * @param quality JPEG quality (0 to 1)
 */
export const resizeImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const elem = document.createElement('canvas');
        
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        
        const ctx = elem.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Return Base64 string
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

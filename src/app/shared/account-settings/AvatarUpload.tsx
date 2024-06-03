import React from 'react';

const AvatarUpload = ({ name, setValue, error }: { name: string; setValue: Function; error: string | null | undefined }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // Safely access the first selected file

    if (selectedFile) {
      localStorage.setItem('img', JSON.stringify(selectedFile));
      const base64String = await convertToBase64(selectedFile);
      console.log('Base64-encoded value:', base64String);
      setValue(name, base64String); // This will set the base64-encoded data in the form state
    }
  };

  const convertToBase64 = (file: File) => {
    return new Promise<string | null>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result?.toString().split(',')[1] ?? null); // Use nullish coalescing to handle possible null or undefined value
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <label htmlFor="avatarInput" className="block text-sm font-medium text-gray-700">
        Upload Photo
      </label>
      <input
        type="file"
        id="avatarInput"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-1 p-2 border border-gray-300 rounded-md"
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </>
  );
};

export default AvatarUpload;

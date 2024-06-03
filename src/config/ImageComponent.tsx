import React, { useState } from 'react';

const ImageComponent: React.FC = () => {
  const [altText, setAltText] = useState<string>('Log Name');

  const handleChangeAlt = (): void => {
    // Change the alt text to something else
    setAltText('New Alt Text');
  };

  return (
    <div>
      <img src={process.env.PUBLIC_URL + '/logo/prosale-favicon.png'} alt={altText} />
      <button onClick={handleChangeAlt}>Change Alt Text</button>
    </div>
  );
};

export default ImageComponent;

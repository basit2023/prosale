import React, { useEffect } from 'react';
import Image from 'next/image';
import logoImgLight from '@public/logo/prosale-main.png';
import logoImgDark from '@public/logo/prosale-dark.png';
import { useTheme } from 'next-themes';


interface LogoProps {
  iconOnly?: boolean;
  darkMode?: boolean;
  className?: string;
}

const themeOptions = ['light', 'dark'];

const Logo: React.FC<LogoProps> = ({ iconOnly = false, darkMode = true, className}) => {
  const { theme, setTheme } = useTheme();
  // console.log("the them is theme:",theme)
  let imageSrc = theme === 'dark' ? logoImgDark:logoImgLight;
  const viewBox = iconOnly ? '0 0 48 26' : '0 0 155 28';

  useEffect(() => {
    // Optional: Uncomment and use this block if you want to dynamically switch between light and dark modes
    // if (theme === 'light' && !darkMode) {
    //   setTheme('dark');
    // }
    // if (theme === 'dark' && darkMode) {
    //   setTheme('light');
    // }
  }, [theme, darkMode, setTheme]);

  return (
    <div style={{ width: iconOnly ? '60px' : '155px', height: '20px' }}>
      <Image
        src={imageSrc}
        alt="Logo Image"
        layout="responsive"
        objectFit="cover"
        quality={100} // adjust the quality as needed
      />
      {!iconOnly && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox={viewBox}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          {/* Your SVG content here */}
        </svg>
      )}
    </div>
  );
};

export default Logo;

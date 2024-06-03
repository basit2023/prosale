import { useTheme } from 'next-themes';

export const presetLight = {
  lighter: '#f1f1f1',
  light: '#666666',
  default: '#111111',
  dark: '#000000',
};

export const presetDark = {
  lighter: '#222222',
  light: '#929292',
  default: '#f1f1f1',
  dark: '#ffffff',
};

// defaults from global css line 38
export const DEFAULT_PRESET_COLORS = {
  lighter: '#c54e57',
  light: '#c54e57',
  default: '#c54e57',
  dark: '#c54e57',
};

export const DEFAULT_PRESET_COLOR_NAME = 'Rose';

export const usePresets = () => {
  const { theme } = useTheme();

  return [
    {
      name: DEFAULT_PRESET_COLOR_NAME,
      colors: DEFAULT_PRESET_COLORS,
    },
    // {
    //   name: 'Black',
    //   colors: {
    //     lighter: theme === 'light' ? presetLight.lighter : presetDark.lighter, // gray 100
    //     light: theme === 'light' ? presetLight.light : presetDark.light, // gray 500
    //     default: theme === 'light' ? presetLight.default : presetDark.default, // gray 900
    //     dark: theme === 'light' ? presetLight.dark : presetDark.dark, // gray 1000
    //   },
    // },
    // {
    //   name: 'Teal',
    //   colors: {
    //     lighter: '#ccfbf1', // Teal 100
    //     light: '#5eead4', // Teal 300
    //     default: '#0d9488', // Teal 600
    //     dark: '#115e59', // Teal 800
    //   },
    // },
    
    
    
  ];
};

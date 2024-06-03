'use client';

import { useTheme } from 'next-themes';
import { siteConfig } from '@/config/site.config';
import { RadioGroup } from '@/components/ui/radio-group';
import { updateThemeColor } from '@/utils/update-theme-color';
import { presetDark, presetLight } from '@/config/color-presets';
import { useEffect } from 'react';
import { useColorPresetName } from '@/hooks/use-theme-color';
import LightMode from '@/components/icons/light-mode';
import DarkMode from '@/components/icons/dark-mode';
import RadioBox from '@/components/settings/radio-box';
import DrawerBlock from '@/components/settings/drawer-block';

const themeOptions = ['light', 'dark'];

export default function ThemeSwitcher({}: any) {
  const { theme, setTheme } = useTheme();
  const { colorPresetName } = useColorPresetName();

  useEffect(() => {
    
    if (theme === 'light' && colorPresetName === 'black') {
      updateThemeColor(
        presetLight.lighter,
        presetLight.light,
        presetLight.default,
        presetLight.dark
      );
    }
    if (theme === 'dark' && colorPresetName === 'black') {
      updateThemeColor(
        presetDark.lighter,
        presetDark.light,
        presetDark.default,
        presetDark.dark
      );
    }
  }, [theme, colorPresetName]);

  return (
    <DrawerBlock title="Appearance">
      <RadioGroup
        value={theme ?? siteConfig.mode}
        setValue={(selectedTheme: any) => {
          setTheme(selectedTheme);
        }}
        className="grid grid-cols-2 gap-4"
        color="primary"
      >
        {themeOptions.map((item) => (
          <RadioBox
            key={item}
            value={item}
            className="flex h-auto flex-col justify-center gap-3 rounded-lg p-0 capitalize"
          >
            <span className="radio-active inline-flex rounded-lg">
              {item === 'light' ? (
                <LightMode aria-label="Light Mode" className="h-full w-full" />
              ) : (
                <DarkMode aria-label="Dark Mode" className="h-full w-full" />
              )}
            </span>
            <span>{item}</span>
          </RadioBox>
        ))}
      </RadioGroup>
    </DrawerBlock>
  );
}

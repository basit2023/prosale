'use client';

import { RadioGroup } from '@/components/ui/radio-group';
import { useLayout } from '@/hooks/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';
import HydrogenIcon from '@/layouts/hydrogen-icon';
import HeliumIcon from '@/layouts/helium-icon';
import LithiumIcon from '@/layouts/lithium-icon';
import BerylliumIcon from '@/layouts/beryllium-icon';
import RadioBox from '@/components/settings/radio-box';
import DrawerBlock from '@/components/settings/drawer-block';

const layoutOptions = [
  {
    icon: HydrogenIcon,
    value: LAYOUT_OPTIONS.HYDROGEN,
  },
  {
    icon: HeliumIcon,
    value: LAYOUT_OPTIONS.HELIUM,
  },
  {
    icon: LithiumIcon,
    value: LAYOUT_OPTIONS.LITHIUM,
  },
  {
    icon: BerylliumIcon,
    value: LAYOUT_OPTIONS.BERYLLIUM,
  },
];

export default function LayoutSwitcher() {
  const { layout, setLayout } = useLayout();

  return (
    <DrawerBlock title="Layout">
      <RadioGroup
        value={layout}
        setValue={(selectedLayout: any) => setLayout(selectedLayout)}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3"
        color="primary"
      >
        {layoutOptions.map((item) => (
          <RadioBox
            key={item.value}
            value={item.value}
            className="flex h-auto flex-col justify-center gap-3 rounded-lg p-0"
          >
            <span className="radio-active inline-flex rounded-lg capitalize">
              <item.icon aria-label={item.value} className="h-[92px] w-full" />
            </span>
            <span>{item.value}</span>
          </RadioBox>
        ))}
      </RadioGroup>
    </DrawerBlock>
  );
}

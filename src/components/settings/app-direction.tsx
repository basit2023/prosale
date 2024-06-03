'use client';

import { PiAlignLeft, PiAlignRight } from 'react-icons/pi';
import { RadioGroup } from '@/components/ui/radio-group';
import { useDirection } from '@/hooks/use-direction';
import RadioBox from '@/components/settings/radio-box';
import DrawerBlock from '@/components/settings/drawer-block';

const directionOptions = ['ltr', 'rtl'];

export default function AppDirection() {
  const { direction, setDirection } = useDirection();

  return (
    <DrawerBlock title="Direction">
      <RadioGroup
        value={direction ?? 'ltr'}
        // @ts-ignore
        setValue={setDirection}
        className="grid grid-cols-2 gap-4"
        color="primary"
      >
        {directionOptions.map((item) => (
          <RadioBox key={item} value={item} className="p-0">
            <span className="radio-active flex h-14 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-4 text-sm uppercase text-gray-700 dark:bg-gray-100">
              {item === 'ltr' ? (
                <PiAlignLeft className="me-2 h-auto w-6 text-gray-400" />
              ) : null}

              <span>{item}</span>

              {item === 'rtl' ? (
                <PiAlignRight className="ms-2 h-auto w-6 text-gray-400" />
              ) : null}
            </span>
          </RadioBox>
        ))}
      </RadioGroup>
    </DrawerBlock>
  );
}

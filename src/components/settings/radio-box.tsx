import cn from '@/utils/class-names';
import { AdvancedRadio } from '@/components/ui/advanced-radio';

export default function RadioBox({
  value,
  children,
  className,
  ...props
}: React.PropsWithChildren<{ value: string; className?: string }>) {
  return (
    <AdvancedRadio
      value={value}
      color="primary"
      className={cn(
        'group flex h-16 items-center justify-center rounded-lg px-6 py-1.5 text-sm font-medium capitalize text-gray-800 hover:cursor-pointer',
        className
      )}
      inputClassName="[&:checked:enabled~span>.radio-active]:ring-2 [&:checked:enabled~span>.radio-active]:ring-offset-4 dark:[&:checked:enabled~span>.radio-active]:ring-offset-gray-100 [&:checked:enabled~span>.radio-active]:ring-primary [&:checked:enabled~span>span]:text-primary"
      {...props}
    >
      {children}
    </AdvancedRadio>
  );
}

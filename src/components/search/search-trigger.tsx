import { PiCommand, PiMagnifyingGlassBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useOs } from '@/hooks/use-os';
import { useState } from 'react';
type SearchTriggerProps = {
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;




export default function SearchTrigger({
  icon,
  className,
  ...props
}: SearchTriggerProps) {
  const os = useOs();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleClick = () => {
    setShowComingSoon(true);
  };

  return (
    // <button
    //   aria-label="Search"
    //   className={cn(
    //     'group inline-flex items-center focus:outline-none active:translate-y-px xl:h-10 xl:w-full xl:max-w-sm xl:rounded-lg xl:border xl:border-gray-200 xl:py-2 xl:pe-2 xl:ps-3.5 xl:shadow-sm xl:backdrop-blur-md xl:transition-colors xl:duration-200 xl:hover:border-gray-900 xl:hover:outline-double xl:hover:outline-[0.5px] xl:hover:outline-gray-900 xl:focus-visible:border-gray-900 xl:focus-visible:outline-double xl:focus-visible:outline-[0.5px] xl:focus-visible:outline-gray-900',
    //     className
    //   )}
    //   onClick={handleClick}
    //   {...props}
    // >
    //   {showComingSoon ? (
    //     <span>Coming Soon</span>
    //   ) : (
    //     <>
    //       {icon ? (
    //         icon
    //       ) : (
    //         <PiMagnifyingGlassBold className="magnifying-glass me-2 h-[18px] w-[18px]" />
    //       )}
    //       <span className="placeholder-text hidden text-sm text-gray-600 group-hover:text-gray-900 xl:inline-flex">
    //         Search your page...
    //       </span>
    //       <span className="search-command ms-auto hidden items-center text-sm text-gray-600 lg:flex lg:rounded-md lg:bg-gray-900 lg:px-1.5 lg:py-1 lg:text-xs lg:font-semibold lg:text-gray-0 xl:justify-normal">
    //         {os === 'macos' ? (
    //           <PiCommand strokeWidth={1.3} className="h-[15px] w-[15px]" />
    //         ) : (
    //           'ctrl'
    //         )}
    //         K
    //       </span>
    //     </>
    //   )}
    // </button>
    <></>
  );
}

// export default function SearchTrigger({
//   icon,
//   className,
//   ...props
// }: SearchTriggerProps) {
//   const os = useOs();

//   return (
//     <button
//       aria-label="Search"
//       className={cn(
//         'group inline-flex items-center focus:outline-none active:translate-y-px xl:h-10 xl:w-full xl:max-w-sm xl:rounded-lg xl:border xl:border-gray-200 xl:py-2 xl:pe-2 xl:ps-3.5 xl:shadow-sm xl:backdrop-blur-md xl:transition-colors xl:duration-200 xl:hover:border-gray-900 xl:hover:outline-double xl:hover:outline-[0.5px] xl:hover:outline-gray-900 xl:focus-visible:border-gray-900 xl:focus-visible:outline-double xl:focus-visible:outline-[0.5px] xl:focus-visible:outline-gray-900',
//         className
//       )}
//       {...props}
//     >
//       {icon ? (
//         icon
//       ) : (
//         <PiMagnifyingGlassBold className="magnifying-glass me-2 h-[18px] w-[18px]" />
//       )}
//       <span className="placeholder-text hidden text-sm text-gray-600 group-hover:text-gray-900 xl:inline-flex">
//         Search your page...
//       </span>
//       <span className="search-command ms-auto hidden items-center text-sm text-gray-600 lg:flex lg:rounded-md lg:bg-gray-900 lg:px-1.5 lg:py-1 lg:text-xs lg:font-semibold lg:text-gray-0 xl:justify-normal">
//         {os === 'macos' ? (
//           <PiCommand strokeWidth={1.3} className="h-[15px] w-[15px]" />
//         ) : (
//           'ctrl'
//         )}
//         K
//       </span>
//     </button>
//   );
// }



// export default function SearchTrigger({
//   icon,
//   className,
//   ...props
// }: SearchTriggerProps) {
//   const os = useOs();

//   return (
//     <button
//       aria-label="Search"
//       className={cn(
//         'group inline-flex items-center focus:outline-none active:translate-y-px xl:h-10 xl:w-full xl:max-w-sm xl:rounded-lg xl:border xl:border-gray-200 xl:py-2 xl:pe-2 xl:ps-3.5 xl:shadow-sm xl:backdrop-blur-md xl:transition-colors xl:duration-200 xl:hover:border-gray-900 xl:hover:outline-double xl:hover:outline-[0.5px] xl:hover:outline-gray-900 xl:focus-visible:border-gray-900 xl:focus-visible:outline-double xl:focus-visible:outline-[0.5px] xl:focus-visible:outline-gray-900',
//         className
//       )}
//       {...props}
//     >
//       {icon ? (
//         icon
//       ) : (
//         <PiMagnifyingGlassBold className="magnifying-glass me-2 h-[18px] w-[18px]" />
//       )}
//       <span className="placeholder-text hidden text-sm text-gray-600 group-hover:text-gray-900 xl:inline-flex">
//         Search your page...
//       </span>
//       <span className="search-command ms-auto hidden items-center text-sm text-gray-600 lg:flex lg:rounded-md lg:bg-gray-900 lg:px-1.5 lg:py-1 lg:text-xs lg:font-semibold lg:text-gray-0 xl:justify-normal">
//         {os === 'macos' ? (
//           <PiCommand strokeWidth={1.3} className="h-[15px] w-[15px]" />
//         ) : (
//           'ctrl'
//         )}
//         K
//       </span>
//     </button>
//   );
// }

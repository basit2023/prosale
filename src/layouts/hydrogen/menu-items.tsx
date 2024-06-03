import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import * as PiIcons from 'react-icons/pi';
import apiService from '@/utils/apiService';

interface MenuItem {
  name: string;
  href: string;
  icon: JSX.Element;
  permission: string;
  dropdownItems?: DropdownItem[];
}

interface DropdownItem {
  name: string;
  href: string;
}

let storedMenuItems: MenuItem[] | null = null;

const fetchMenuItems = async (): Promise<void> => {
  try {
    const response = await apiService.get('/items');
    const data: any[] = await response.data;
  

    const menuItems: MenuItem[] = await Promise.all(
      data.map(async (item) => {
        const IconComponent = PiIcons[item.icon];

        if (!IconComponent) {
          console.error(`Icon component not found for ${item.icon}`);
          return null;
        }

        const stringWithQuotes = item.href;

        const stringWithoutQuotes = stringWithQuotes.replace(/['"]+/g, '');

        const parts = stringWithoutQuotes.split('.');
        const final = parts.reduce((acc, part) => (acc && acc[part] ? acc[part] : undefined), routes);
        const menuItem: MenuItem = {
          name: item.name,
          href: final,
          icon: <IconComponent />,
          permission: item.permission,
        };

        if (item.dropdownItems === "YES") {
          try {
            const dropdownResponse = await apiService.get(`/dropdown/${item.id}`);
            const dropdownData: any[] = await dropdownResponse.data;
            const transformedArray: DropdownItem[] = dropdownData.map((dropdownItem) => {
              const stringWithQuot = dropdownItem.href;
             
              const stringWithoutQuot = stringWithQuot.replace(/['"]+/g, '');
             

              const parts1 = stringWithoutQuot.split('.');
              const final1 = parts1.reduce((acc, part) => (acc && acc[part] ? acc[part] : ''), routes);

              return {
                name: dropdownItem.name,
                href: final1,
                permission_level:dropdownItem.permission_level,
              };
            });

            menuItem.dropdownItems = transformedArray;
          } catch (error) {
            console.error('Error fetching dropdown items:', error);
          }
        }
       
        return menuItem;
      })
    );

    storedMenuItems = menuItems.filter(Boolean);
  } catch (error) {
    console.error(error);
  }
};

export const getMenuItems = async (): Promise<MenuItem[]> => {
  if (storedMenuItems === null) {
    await fetchMenuItems();
  }

  return storedMenuItems || [];
};

export default getMenuItems;

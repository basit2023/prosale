import { Title } from '@/components/ui/text';
import Breadcrumb from '@/components/ui/breadcrumb';
import cn from '@/utils/class-names';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';

export type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
};

export default function PageHeader({
  title,
  breadcrumb,
  children,
  className,
}: React.PropsWithChildren<PageHeaderTypes>) {

    const { data: session } = useSession();
    const [value, setValue] = useState<any>([]);
    const [value1, setValue1] = useState([]);
  
    useEffect(() => {
        const fetchData = async () => {
          
          try {
            const response = await apiService.get(`/personalinfo-by-id/${title}`);
            const userData = response.data;
          
            setValue(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
      
          }
        
         
        };
    
        if (session) {
          fetchData();
        }
      }, [session]);


  return (
    <header className={cn('mb-6 @container xs:-mt-2 lg:mb-7', className)}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <Title
            as="h2"
            className="mb-2 text-[22px] lg:text-2xl 4xl:text-[26px]"
          >
           Leads for {value?.user?.first_name} {value?.user?.last_name}
          </Title>

          <Breadcrumb
            separator=""
            separatorVariant="circle"
            className="flex-wrap"
          >
            {breadcrumb?.map((item) => (
              <Breadcrumb.Item
                key={item.name}
                {...(item?.href && { href: item?.href })}
              >
                {item.name}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
        {/* {children} */}
      </div>
    </header>
  );
}

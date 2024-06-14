import { Title } from '@/components/ui/text';
import Breadcrumb from '@/components/ui/breadcrumb';
import cn from '@/utils/class-names';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';
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
          if (session) {

            const response = await apiService.get(`/teamates/${title}/?email=${session?.user?.email}`);
            const userData = response.data.team[0].title;
          
            setValue(userData);
          }
        } catch (error:any) {
          console.error('Error fetching team memeber:', error);
          toast.error(error.response.data.message)
          
        }
      };
  
      fetchData();
      // eslint-disable-next-line react-hooks/rules-of-hooks
    }, [session]);
  


  return (
    <header className={cn('mb-6 @container xs:-mt-2 lg:mb-7', className)}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <Title
            as="h2"
            className="mb-2 text-[22px] lg:text-2xl 4xl:text-[26px]"
          >
            Team {value}
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
        {children}
      </div>
    </header>
  );
}

import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // read route params
    const id = params.id;
    

    return metaObject(`Edit ${id}`);
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    throw error; 
  }
}

// Call generateMetadata function and export the result as a constant named metadata
export const metadata = generateMetadata;

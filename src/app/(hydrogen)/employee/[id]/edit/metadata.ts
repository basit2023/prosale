import { Metadata, ResolvingMetadata } from 'next';
import { metaObject } from '@/config/site.config';
import { Robots } from 'next/dist/lib/metadata/types/metadata-types';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch ${url}: ${text}`);
  }
  return response.json();
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  try {
    const [
      personalInfo,
      vaultInfo,
      employeeDetails,
      contactInfo,
      officeInfo,
      salaryInfo,
      teamInfo,
    ] = await Promise.all([
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/emp-personalinfo/${id}`),
      // fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/update_employee-vault-info/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     vaultField1: "value1",
      //     vaultField2: "value2",
      //     // other fields as required
      //   }),
      // }),
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/get-employee-details/${id}`),
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/employee-contect-info/${id}`),
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/employee-office/${id}`),
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/employee-salary-info/${id}`),
      // fetchJson(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/update-employee-team/${id}`),
    ]);

    const previousMetadata = await parent;

    return {
      ...previousMetadata,
      title: `Edit Employee with ${id}`,
    //   description: `Edit details for employee ${personalInfo.name}`,
      
      robots: previousMetadata.robots as string | Robots | null | undefined,
    };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      title: 'Error loading employee data',
      description: 'There was an error loading the employee data.',
    };
  }
}

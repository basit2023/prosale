const apiUrl = 'http://localhost:4000/api';

const fetchData = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      ...options,
      credentials: 'include',
      mode: 'cors', // This is important for cross-origin requests
    });

    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default fetchData;

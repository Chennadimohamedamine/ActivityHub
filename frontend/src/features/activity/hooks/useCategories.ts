import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../services/activities.api.ts';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
  });
};

import { useSearchParams } from 'react-router';

export const useUrlPagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10) || 10;

  const setPage = (page: number) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
  };

  const setPageSize = (pageSize: number) => {
    searchParams.set('pageSize', pageSize.toString());
    setSearchParams(searchParams);
  };

  return { page, pageSize, setPage, setPageSize: setPageSize };
};

import { useEffect, useState } from 'react';

const useQuery = ({ search }) => {
  const [query, setQuery] = useState(undefined);

  useEffect(() => {
    setQuery(new URLSearchParams(search));
  }, [search]);

  return query;
};

export default useQuery;

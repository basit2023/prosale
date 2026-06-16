import { useState, useEffect, useMemo } from 'react';
import isString from 'lodash/isString';

interface AnyObject {
  [key: string]: any;
}

function hasFilterValue(value: any) {
  if (Array.isArray(value)) {
    return value.some((item) => item !== null && item !== undefined && item !== '');
  }
  return value !== null && value !== undefined && value !== '';
}

function deepIncludes(value: any, searchTerm: string): boolean {
  if (!value) return false;
  if (typeof value === 'object') {
    return Object.values(value).some((nestedItem) =>
      deepIncludes(nestedItem, searchTerm)
    );
  }
  return String(value).toLowerCase().includes(searchTerm);
}

function matchesFilter(item: AnyObject, columnId: string, filterValue: any) {
  if (!hasFilterValue(filterValue)) return true;

  if (Array.isArray(filterValue) && typeof filterValue[1] === 'object') {
    const [start, end] = filterValue;
    if (!start || !end) return true;

    const itemValue = new Date(item[columnId]);
    return itemValue >= start && itemValue <= end;
  }

  if (Array.isArray(filterValue) && typeof filterValue[1] === 'string') {
    const [min, max] = filterValue;
    const itemPrice = Math.ceil(Number(item[columnId]));
    const minValue = min === '' ? Number.NEGATIVE_INFINITY : Number(min);
    const maxValue = max === '' ? Number.POSITIVE_INFINITY : Number(max);

    return itemPrice >= minValue && itemPrice <= maxValue;
  }

  if (isString(filterValue)) {
    const itemValue = item[columnId]?.toString().toLowerCase();
    return itemValue === filterValue.toString().toLowerCase();
  }

  return true;
}

export function useTable<T extends AnyObject>(
  initialData: T[],
  countPerPage: number = 10,
  initialFilterState?: Partial<Record<string, any>>
) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  const [sortConfig, setSortConfig] = useState<AnyObject>({
    key: null,
    direction: null,
  });

  function sortData(data: T[], sortKey: string, sortDirection: string) {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return sortData(data, sortConfig.key, sortConfig.direction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig, data]);

  function handleSort(key: string) {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const [currentPage, setCurrentPage] = useState(1);
  function paginatedData(data: T[]) {
    const start = (currentPage - 1) * countPerPage;
    const end = start + countPerPage;

    if (data.length > start) return data.slice(start, end);
    return data;
  }

  function handlePaginate(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

  function handleDelete(id: string | string[]) {
    const updatedData = Array.isArray(id)
      ? data.filter((item) => !id.includes(item.id))
      : data.filter((item) => item.id !== id);

    setData(updatedData);
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(
    initialFilterState ?? {}
  );

  function updateFilter(columnId: string, filterValue: string | any[]) {
    if (!Array.isArray(filterValue) && !isString(filterValue)) {
      throw new Error('filterValue data type should be string or array of any');
    }

    if (Array.isArray(filterValue) && filterValue.length !== 2) {
      throw new Error('filterValue data must be an array of length 2');
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnId]: filterValue,
    }));
  }

  const isFiltered = useMemo(
    () => Object.values(filters).some(hasFilterValue),
    [filters]
  );

  const filteredAndSearchedData = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();

    if (!isFiltered && !searchTermLower) return sortedData;

    return sortedData.filter((item) => {
      const matchesFilters =
        !isFiltered ||
        Object.entries(filters).every(([columnId, filterValue]) =>
          matchesFilter(item, columnId, filterValue)
        );
      const matchesSearch =
        !searchTermLower ||
        Object.values(item).some((value) => deepIncludes(value, searchTermLower));

      return matchesFilters && matchesSearch;
    });
  }, [filters, isFiltered, searchTerm, sortedData]);

  function applyFilters() {
    return filteredAndSearchedData;
  }

  function searchedData() {
    return filteredAndSearchedData;
  }

  function handleSearch(searchValue: string) {
    setSearchTerm(searchValue);
  }

  function handleReset() {
    setData(() => initialData);
    handleSearch('');
    if (initialFilterState) return setFilters(initialFilterState);
  }

  const tableData = paginatedData(filteredAndSearchedData);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const handleRowSelect = (recordKey: string) => {
    const selectedKeys = [...selectedRowKeys];
    if (selectedKeys.includes(recordKey)) {
      setSelectedRowKeys(selectedKeys.filter((key) => key !== recordKey));
    } else {
      setSelectedRowKeys([...selectedKeys, recordKey]);
    }
  };
  const handleSelectAll = () => {
    const currentPageData = paginatedData(filteredAndSearchedData);
    const pageIds = currentPageData.map((record) => record.id);
    const isAllSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedRowKeys.includes(id));

    if (isAllSelected) {
      setSelectedRowKeys((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedRowKeys((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  useEffect(() => {
    handlePaginate(1);
  }, [isFiltered, searchTerm, countPerPage]);

  return {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    totalItems: filteredAndSearchedData.length,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    searchTerm,
    handleSearch,
    filters,
    updateFilter,
    applyFilters,
    searchedData,
    handleDelete,
    handleReset,
  };
}

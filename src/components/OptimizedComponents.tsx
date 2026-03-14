'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RefreshCw, Loader2, Grid, List, BarChart3, Users, TrendingUp, Calendar, Eye, EyeOff } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

interface OptimizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  itemHeight?: number;
  threshold?: number;
}

// Lazy loading component for heavy lists
function LazyLoadComponent({ children, loadMore, hasMore, loading }: LazyLoadProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  return (
    <div>
      {children}
      <div ref={observerRef} className="h-4 flex items-center justify-center">
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Optimized list component with virtualization
function OptimizedList({ 
  items, 
  renderItem, 
  loading = false, 
  onLoadMore, 
  hasMore, 
  itemHeight = 80, 
  threshold = 5 
}: OptimizedListProps) {
  const [visibleItems, setVisibleItems] = useState(itemHeight * 2);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const newScrollTop = element.scrollTop;
    setScrollTop(newScrollTop);

    // Calculate visible items based on scroll position
    const startIndex = Math.floor(newScrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItems, items.length);
    setVisibleItems(endIndex - startIndex);
  }, [itemHeight, visibleItems, items.length]);

  const visibleItemsSlice = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    return items.slice(startIndex, startIndex + visibleItems);
  }, [items, scrollTop, itemHeight, visibleItems]);

  return (
    <div 
      className="h-96 overflow-y-auto border border-gray-200 rounded-lg"
      onScroll={handleScroll}
      style={{ height: '400px' }}
    >
      <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
        {visibleItemsSlice.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              position: 'absolute', 
              top: `${index * itemHeight}px`,
              height: `${itemHeight}px`,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center p-4">
          <button
            onClick={onLoadMore}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ChevronDown className="w-4 h-4" />
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

// Optimized search component with debouncing
function OptimizedSearch({ onSearch, placeholder }: { onSearch: (query: string) => void; placeholder: string }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);
      // TODO: Replace with actual suggestions from API/database
      const mockSuggestions = [
        `${debouncedQuery} for beginners`,
        `Advanced ${debouncedQuery}`,
        `${debouncedQuery} certification`,
        `${debouncedQuery} best practices`
      ].slice(0, 5);
      setSuggestions(mockSuggestions);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
                onSearch(suggestion);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Optimized data table with pagination and sorting
function OptimizedDataTable({ 
  data, 
  columns, 
  loading = false, 
  onPageChange,
  currentPage,
  totalPages,
  onSort,
  sortField,
  sortOrder 
}: {
  data: any[];
  columns: Array<{
    key: string;
    title: string;
    dataIndex: string;
    sortable?: boolean;
    render?: (value: any, record: any) => React.ReactNode;
  }>;
  loading?: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  onSort: (field: string, order: 'asc' | 'desc') => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const [localSortField, setLocalSortField] = useState(sortField || '');
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder || 'asc');

  const handleSort = (field: string) => {
    const newOrder = localSortField === field && localSortOrder === 'asc' ? 'desc' : 'asc';
    setLocalSortField(field);
    setLocalSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const sortedData = useMemo(() => {
    if (!localSortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[localSortField];
      const bValue = b[localSortField];
      
      if (aValue < bValue) {
        return localSortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return localSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, localSortField, localSortOrder]);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`p-2 border border-gray-300 rounded hover:bg-gray-50 ${
              page === currentPage ? 'bg-blue-600 text-white' : ''
            }`}
          >
            {page}
          </button>
        ))}
        
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.dataIndex)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <div className="flex items-center">
                        {localSortField === column.dataIndex && localSortOrder === 'asc' && (
                          <ChevronUp className="w-4 h-4" />
                        )}
                        {localSortField === column.dataIndex && localSortOrder === 'desc' && (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(record[column.dataIndex], record) : record[column.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200">
        {renderPagination()}
      </div>
    </div>
  );
}

// Main optimized components export
export {
  LazyLoadComponent,
  OptimizedList,
  OptimizedSearch,
  OptimizedDataTable
};

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime: prev.renderTime + renderTime,
        componentCount: prev.componentCount + 1
      }));
    };
  }, []);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize
      }));
    }
  }, []);

  return {
    metrics,
    measureRender,
    measureMemory
  };
}

// Infinite scroll hook
export function useInfiniteScroll(
  fetchData: (page: number) => Promise<any[]>,
  initialData: any[] = []
) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newData = await fetchData(page + 1);
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
      setHasMore(newData.length > 0);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, loading, hasMore, page]);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    page
  };
}

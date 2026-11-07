import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filterOptions?: { label: string; value: string; filterFn: (item: T) => boolean }[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filterOptions,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria at this moment.',
  emptyAction,
  headerRight
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterIndex, setActiveFilterIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let result = data;

    // Apply category filter if active
    if (filterOptions && filterOptions[activeFilterIndex] && filterOptions[activeFilterIndex].value !== 'ALL') {
      result = result.filter(filterOptions[activeFilterIndex].filterFn);
    }

    // Apply search query
    if (searchQuery.trim() && searchFilter) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => searchFilter(item, q));
    }

    return result;
  }, [data, searchQuery, searchFilter, filterOptions, activeFilterIndex]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Table Toolbar */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            maxWidth: '320px',
            width: '100%'
          }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Optional Filter Pills */}
          {filterOptions && filterOptions.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {filterOptions.map((opt, idx) => (
                <button
                  key={opt.value}
                  onClick={() => { setActiveFilterIndex(idx); setCurrentPage(1); }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeFilterIndex === idx ? '#ffffff' : 'transparent',
                    color: activeFilterIndex === idx ? '#059669' : '#64748b',
                    boxShadow: activeFilterIndex === idx ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {headerRight && (
          <div>{headerRight}</div>
        )}
      </div>

      {/* Table Content */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '12px 18px',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    width: col.width,
                    textAlign: col.align || 'left'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      marginBottom: '12px'
                    }}>
                      <Inbox size={24} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {emptyTitle}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', marginBottom: emptyAction ? '16px' : '0' }}>
                      {emptyDescription}
                    </div>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map(item => (
                <tr key={keyExtractor(item)} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '14px 18px',
                        color: '#334155',
                        textAlign: col.align || 'left'
                      }}
                    >
                      {col.render
                        ? col.render(item)
                        : col.accessor
                        ? typeof col.accessor === 'function'
                          ? col.accessor(item)
                          : (item[col.accessor] as unknown as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff'
        }}>
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to{' '}
            <strong style={{ color: '#0f172a' }}>{Math.min(startIndex + pageSize, filteredData.length)}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validCurrentPage <= 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: validCurrentPage <= 1 ? '#cbd5e1' : '#0f172a',
                cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ padding: '0 8px', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage >= totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: validCurrentPage >= totalPages ? '#cbd5e1' : '#0f172a',
                cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


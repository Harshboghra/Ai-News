import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and neighbors
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      // Always show first page
      pages.push(1);
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`pagination ${className}`} role="navigation" aria-label="Pagination">
      <div className="pagination-container">
        <button
          className="pagination-btn pagination-btn-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <span className="pagination-arrow">‹</span>
          <span className="pagination-label">Previous</span>
        </button>

        <div className="pagination-pages" role="list">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              className={`pagination-page ${page === currentPage ? 'pagination-page-active' : ''} ${
                page === -1 ? 'pagination-ellipsis' : ''
              }`}
              onClick={() => page !== -1 && handlePageChange(page)}
              disabled={page === -1 || page === currentPage}
              aria-label={page === -1 ? 'More pages' : `Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page === -1 ? '...' : page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn pagination-btn-next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <span className="pagination-label">Next</span>
          <span className="pagination-arrow">›</span>
        </button>
      </div>

      <div className="pagination-info" aria-live="polite">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}

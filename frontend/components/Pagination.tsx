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
    console.log('Pagination clicked:', { 
      currentPage, 
      totalPages, 
      clickedPage: page,
      isValid: page >= 1 && page <= totalPages && page !== currentPage
    });
    
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log('Calling onPageChange with page:', page);
      onPageChange(page);
    } else {
      console.log('Page change blocked - invalid page');
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
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
    <div className={`pagination ${className}`}>
      <button
        className="btn btn-ghost pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous page"
      >
        ‹ Previous
      </button>

      <div className="pagination-pages">
        {visiblePages.map((page, index) => (
          <button
            key={index}
            className={`btn pagination-page ${page === currentPage ? 'btn-primary' : 'btn-ghost'} ${
              page === -1 ? 'ellipsis' : ''
            }`}
            onClick={() => page !== -1 && handlePageChange(page)}
            disabled={page === -1 || page === currentPage}
          >
            {page === -1 ? '...' : page}
          </button>
        ))}
      </div>

      <button
        className="btn btn-ghost pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Next page"
      >
        Next ›
      </button>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

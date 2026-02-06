import React from 'react';
import '../styles/pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 12, 
  onPageChange = () => {},
  showInfo = true,
  // Legacy props support
  page,
  totalPages,
  onChange
}) => {
  // Support both new and legacy prop names
  const currentPageValue = page !== undefined ? page : currentPage;
  const totalPagesValue = totalPages !== undefined ? totalPages : Math.ceil(totalItems / itemsPerPage);
  const handleChange = onChange || onPageChange;
  
  if (totalPagesValue <= 1) return null;

  const handlePrevious = () => {
    if (currentPageValue > 1) {
      handleChange(currentPageValue - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPageValue < totalPagesValue) {
      handleChange(currentPageValue + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (newPage) => {
    if (newPage !== currentPageValue) {
      handleChange(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageValue - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPagesValue, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Last page
    if (endPage < totalPagesValue) {
      if (endPage < totalPagesValue - 1) {
        pages.push('...');
      }
      pages.push(totalPagesValue);
    }

    return pages;
  };

  const startItem = (currentPageValue - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPageValue * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      {showInfo && totalItems > 0 && (
        <div className="pagination-info">
          Showing <span className="pagination-highlight">{startItem}</span> to <span className="pagination-highlight">{endItem}</span> of <span className="pagination-highlight">{totalItems}</span> results
        </div>
      )}

      <div className="pagination-wrapper">
        <button
          className="pagination-btn pagination-btn-prev"
          onClick={handlePrevious}
          disabled={currentPageValue === 1}
          title="Previous page"
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                •••
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${page === currentPageValue ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                title={`Go to page ${page}`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          className="pagination-btn pagination-btn-next"
          onClick={handleNext}
          disabled={currentPageValue === totalPagesValue}
          title="Next page"
        >
          Next →
        </button>
      </div>

      <div className="pagination-stats">
        Page <span className="pagination-highlight">{currentPageValue}</span> of <span className="pagination-highlight">{totalPagesValue}</span>
      </div>
    </div>
  );
};

export default Pagination;

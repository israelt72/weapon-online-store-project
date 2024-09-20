import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, paginate }) => {
  const maxButtons = 5; 
  // Calculate the range of page numbers to display
  const getPageRange = () => {
    const start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageRange = getPageRange();

  return (
    <div className="pagination">
      {currentPage > 1 && (
        <button onClick={() => paginate(currentPage - 1)} className="pagination-button">
          &laquo;
        </button>
      )}

      {pageRange.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => paginate(pageNumber)}
          className={`pagination-button ${pageNumber === currentPage ? 'active' : ''}`}
        >
          {pageNumber}
        </button>
      ))}

      {currentPage < totalPages && (
        <button onClick={() => paginate(currentPage + 1)} className="pagination-button">
          &raquo;
        </button>
      )}
    </div>
  );
};

export default Pagination;

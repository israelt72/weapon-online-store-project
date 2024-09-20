// ProductList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, selectProductStatus } from '../redux/productSlice';
import ProductCard from '../components/ProductCard';
import { AppDispatch } from '../app/appStore';
import Pagination from '../components/Pagination';

// Constants for card dimensions
const CARD_WIDTH = 322; 
const CARD_HEIGHT = 430; 
const GUTTER = 16; 

const ProductList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const products = useSelector(selectProducts);
  const status = useSelector(selectProductStatus);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(14); // Default value

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const windowWidth = window.innerWidth;

      // Check if the screen width is less than 360px
      if (windowWidth < 360) {
        setItemsPerPage(1); // Set to 1 card for small screens
      } else {
        // Calculate how many cards fit per row and how many rows fit in the viewport
        const cardsPerRow = Math.floor((windowWidth - GUTTER) / (CARD_WIDTH + GUTTER));
        const rowsPerPage = Math.floor(window.innerHeight / (CARD_HEIGHT + GUTTER));
        setItemsPerPage(cardsPerRow * rowsPerPage);
      }
    };

    updateItemsPerPage(); // Initial call
    window.addEventListener('resize', updateItemsPerPage);

    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when itemsPerPage changes
  }, [itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="product-list-container">
      <div className="product-list">
        {status === 'loading' && <div>Loading...</div>}
        {status === 'failed' && <div>Error fetching products</div>}
        {status === 'succeeded' && (
          <>
            <div className="products">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;

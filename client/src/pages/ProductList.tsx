// ProductList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, selectProductStatus } from '../redux/productSlice';
import ProductCard from '../components/ProductCard';
import { AppDispatch } from '../app/appStore';

const ProductList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const products = useSelector(selectProducts);
  const status = useSelector(selectProductStatus);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="product-list">
      {status === 'loading' && <div>Loading...</div>}
      {status === 'failed' && <div>Error fetching products</div>}
      {status === 'succeeded' && (
        <>
          <h2>Products</h2>
          <div className="products">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              &lt; Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={`page-${index + 1}`} // Unique key for each button
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;

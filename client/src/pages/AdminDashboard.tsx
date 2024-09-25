// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, updateProduct, deleteProduct, createProduct, Review } from '../redux/productSlice';
import { RootState, AppDispatch } from '../app/appStore';
import AdminOrderManagement from '../pages/AdminOrderManagement';
import Pagination from '../components/Pagination'; 
import '../pages/AdminDashboard.css';
import AdminUserManagement from '../pages/AdminUserManagement';

// Define types for product and form data
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    reviews: Review[];
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    image: string;
    stock: string;
}

const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector((state: RootState) => selectProducts(state));
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [showUserManagement, setShowUserManagement] = useState<boolean>(false);
    const [showOrderManagement, setShowOrderManagement] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [updatedProduct, setUpdatedProduct] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: ''
    });
    const [newProduct, setNewProduct] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: ''
    });

    const [showProducts, setShowProducts] = useState<boolean>(false); // State for products visibility
    const [activeButton, setActiveButton] = useState<string | null>(null); // Track active button state

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 4;

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setUpdatedProduct({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            image: product.image,
            stock: product.stock.toString()
        });
        setShowEdit(true);
        setActiveButton('products');
    };

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = () => {
        if (selectedProduct) {
            const updatedData = {
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: Number(updatedProduct.price),
                category: updatedProduct.category,
                image: updatedProduct.image,
                stock: Number(updatedProduct.stock),
                reviews: selectedProduct.reviews 
            };
            dispatch(updateProduct({ id: selectedProduct._id, data: updatedData }))
                .catch((error) => {
                    // Handle update error
                    console.error("Failed to update product:", error);
                });
            setShowEdit(false);
            setSelectedProduct(null);
            setActiveButton(null);
        }
    };
    const handleBackClick = () => {
        setUpdatedProduct({
            name: '',
            description: '',
            price: '',
            category: '',
            image: '',
            stock: ''
        });
        setShowEdit(false);
        setSelectedProduct(null);
        setActiveButton(null);
    };
    const handleDelete = (productId: string) => {
        dispatch(deleteProduct(productId))
            .catch((error) => {
                // Handle delete error
                console.error("Failed to delete product:", error);
            });
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = () => {
        const newProductData: Omit<Product, '_id'> = {
            name: newProduct.name,
            description: newProduct.description,
            price: Number(newProduct.price),
            category: newProduct.category,
            image: newProduct.image,
            stock: Number(newProduct.stock),
            reviews: [] // Ensure this matches the expected type
        };
        dispatch(createProduct(newProductData))
            .catch((error) => {
                // Handle create error
                console.error("Failed to create product:", error);
            });
        setShowCreate(false);
        setNewProduct({
            name: '',
            description: '',
            price: '',
            category: '',
            image: '',
            stock: ''
        });
        setActiveButton(null);
    };

    // Create an array of page numbers
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className='h1-AdminDashboard'>
            <h1 className=' hidden-header'>Admin Dashboard</h1>
            <div className="hide-buttons-container">
                <button
                    className={`hide-button ${activeButton === 'products' ? 'active' : ''}`}
                    onClick={() => {
                        setShowProducts(!showProducts);
                        setActiveButton(showProducts ? null : 'products');
                    }}
                    disabled={Boolean(activeButton) && activeButton !== 'products'}
                >
                    {showProducts ? 'Hide Products' : 'Edit Products'}
                </button>
                <button
                    className={`hide-button ${activeButton === 'create' ? 'active' : ''}`}
                    onClick={() => {
                        setShowCreate(!showCreate);
                        setActiveButton(showCreate ? null : 'create');
                    }}
                    disabled={Boolean(activeButton) && activeButton !== 'create'}
                >
                    {showCreate ? 'Hide Create Product' : 'Create Product'}
                </button>
                <button
                    className={`hide-button ${activeButton === 'users' ? 'active' : ''}`}
                    onClick={() => {
                        setShowUserManagement(!showUserManagement);
                        setActiveButton(showUserManagement ? null : 'users');
                    }}
                    disabled={Boolean(activeButton) && activeButton !== 'users'}
                >
                    {showUserManagement ? 'Hide User Management' : 'Manage Users'}
                </button>
                <button
                    className={`hide-button ${activeButton === 'orders' ? 'active' : ''}`}
                    onClick={() => {
                        setShowOrderManagement(!showOrderManagement);
                        setActiveButton(showOrderManagement ? null : 'orders');
                    }}
                    disabled={Boolean(activeButton) && activeButton !== 'orders'}
                >
                    {showOrderManagement ? 'Hide Order Management' : 'Manage Orders'}
                </button>
            </div>
            {showCreate && (
                <div className="create-form">
                    <h2>Create New Product</h2>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={newProduct.name}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <label>
                        Description:
                        <input
                            type="text"
                            name="description"
                            value={newProduct.description}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <label>
                        Price:
                        <input
                            type="number"
                            name="price"
                            value={newProduct.price}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <label>
                        Category:
                        <input
                            type="text"
                            name="category"
                            value={newProduct.category}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <label>
                        Image URL:
                        <input
                            type="text"
                            name="image"
                            value={newProduct.image}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <label>
                        Stock:
                        <input
                            type="number"
                            name="stock"
                            value={newProduct.stock}
                            onChange={handleCreateChange}
                        />
                    </label>
                    <button
                        className="create-button"
                        onClick={handleCreateSubmit}
                    >
                        Create Product
                    </button>
                </div>
            )}
            {showEdit && selectedProduct && (
                <div className="edit-form">
                    <h2>Edit Product</h2>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={updatedProduct.name}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Description:
                        <input
                            type="text"
                            name="description"
                            value={updatedProduct.description}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Price:
                        <input
                            type="number"
                            name="price"
                            value={updatedProduct.price}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Category:
                        <input
                            type="text"
                            name="category"
                            value={updatedProduct.category}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Image URL:
                        <input
                            type="text"
                            name="image"
                            value={updatedProduct.image}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Stock:
                        <input
                            type="number"
                            name="stock"
                            value={updatedProduct.stock}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <div>
                        <button
                            className="update-button"
                            onClick={handleUpdateSubmit}
                        >
                            Update Product
                        </button>
                        <button
                            className="back-button"
                            onClick={handleBackClick}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
            {showProducts && ( // Products are shown only if "showProducts" is true
                <div className="product-list">
                    {currentProducts.map(product => (
                        <div key={product._id} className="product-item">
                           <img src={product.image} alt={product.name} className="product-image" />
                             <div className="product-info">
                                <h2  className='product-name'>{product.name}</h2>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
                                <p>Category: {product.category}</p>
                                <p>Stock: {product.stock}</p>
                            </div>
                            <div className="product-actions">
                                <button
                                    className="edit-btn" // Preserve the existing className
                                    onClick={() => handleEditClick(product)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(product._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showProducts && ( // Pagination should also be shown only if "showProducts" is true
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                />
            )}
            {showUserManagement && <AdminUserManagement />}
            {showOrderManagement && <AdminOrderManagement />}
       
        </div>
    );
};

export default AdminDashboard;

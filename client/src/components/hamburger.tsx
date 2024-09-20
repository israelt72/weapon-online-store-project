import React, { useState } from 'react';

const SimpleNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav>
      <div onClick={toggleMenu} style={{ cursor: 'pointer' }}>
        <span>☰</span>
      </div>
      <ul style={{ display: isOpen ? 'block' : 'none' }}>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/cart">Cart</a></li>
      </ul>
    </nav>
  );
};

export default SimpleNavBar;

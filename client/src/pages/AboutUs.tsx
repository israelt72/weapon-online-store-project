// AboutUs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles.css';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-background">
        <h1>About Our Weapons Store</h1>
        <p>
          Welcome to our weapons store! This project is a demonstration of a full-stack MERN application, showcasing an online store setup. Here, we feature a range of historical and modern weaponry for enthusiasts and collectors.
        </p>
        <p>
          Our collection includes iconic weapons that have made a mark in history. From classic revolvers to modern firearms, we aim to provide a rich experience with detailed information and images. Please note, this project is purely demonstrational and does not involve the actual sale of weapons.
        </p>
        <p>
          Explore our catalog and learn more about the stories and designs behind each weapon. Thank you for visiting our weapons store project. This project highlights the capabilities of the MERN stack in building comprehensive eCommerce platforms.
        </p>
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default AboutUs;

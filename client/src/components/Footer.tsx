//Footer.tsx
import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h4>About Us</h4>
          <p className='footer-about'>
            We are an eCommerce company dedicated to providing the best online shopping experience. 
            Our mission is to offer high-quality products at competitive prices.
          </p>
        </div>
        <div className="footer-middle">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/aboutUs">About Us</a></li>
            <li><a href="/contactus">Contact Us</a></li>
          
          </ul>
        </div>
        <div className="footer-right">
          <h4>Contact Us</h4>
          <p>Email: israel.taub1@gmail.com</p>
          <p>Phone: 0524637084</p>
        </div>
     
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ISRAEL TAUB. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

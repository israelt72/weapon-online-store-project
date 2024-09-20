// Home.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectFeaturedProducts, selectProductStatus, selectProductError } from '../redux/productSlice';
import { Link } from 'react-router-dom';
import './home.css';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const featuredProducts = useSelector(selectFeaturedProducts);
  const status = useSelector(selectProductStatus);
  const error = useSelector(selectProductError);
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setImages([
      '/assets/carousel/img1.jpg',
      '/assets/carousel/img2.jpg',
      '/assets/carousel/img3.jpg',
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts() as any);
    }
  }, [dispatch, status]);

  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('soundEnabled') === 'true';
    setSoundEnabled(savedSoundEnabled);
  }, []);

  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  const playSound = (soundId: string) => {
    if (soundEnabled) {
      const sound = document.getElementById(soundId) as HTMLAudioElement;
      if (sound) {
        sound.play().catch(() => {
          console.log(`${soundId} playback was prevented`);
        });
      }
    }
  };

  const handleClick = () => {
    playSound('clickSound');
  };

  const handleHover = () => {
    playSound('hoverSound');
  };

  const handleUserInteraction = () => {
    playSound('interactionSound');
  };

  // Trigger user interaction to play sound if sound is enabled
  useEffect(() => {
    const handleUserInteractionEvent = () => {
      handleUserInteraction();
      document.removeEventListener('click', handleUserInteractionEvent);
    };

    document.addEventListener('click', handleUserInteractionEvent);
    return () => document.removeEventListener('click', handleUserInteractionEvent);
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to the Ultimate Weapons Store</h1>
        <p>Discover our wide range of firearms, ammunition, and accessories.</p>
        <Link
          to="/products"
          className="shop-now-button"
          onClick={handleClick}
          onMouseEnter={handleHover}
        >
          Shop Now
        </Link>
      </div>
      <div className="featured-products">
        <div className="carousel-container">
          <div className="carousel">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`carousel-img-${index}`}
                className={`carousel-image ${index === activeIndex ? 'active' : 'inactive'}`}
              />
            ))}
          </div>
          <div className="carousel-title">Featured Products</div>
        </div>
      </div>
      <audio id="interactionSound" src="/assets/sound/The Good, the Bad and the Ugly.mp3" />
      <audio id="clickSound" src="/assets/sound/Gunshot.mp3" />
      <audio id="hoverSound" src="/assets/sound/Gun Sound Effects.mp3" />
    </div>
  );
};

export default Home;

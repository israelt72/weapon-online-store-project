// src/components/RatingStars.tsx
import React from 'react';
import './RatingStars.css';

interface RatingStarsProps {
  averageRating: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ averageRating }) => {
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="rating-stars">
      {[...Array(fullStars)].map((_, starIndex) => (
        <span key={`full-${starIndex}`} className="star full">&#9733;</span>
      ))}
      {halfStar === 1 && <span key="half" className="star half">&#9733;</span>}
      {[...Array(emptyStars)].map((_, starIndex) => (
        <span key={`empty-${starIndex}`} className="star empty">&#9733;</span>
      ))}
    </div>
  );
};

export default RatingStars;

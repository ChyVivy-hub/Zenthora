import React from 'react';
import './LoadingSkeleton.css';

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-line skeleton-price"></div>
      </div>
    </div>
  );
}

export function ProductRowSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-row">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton-hero">
      <div className="skeleton-hero-content">
        <div className="skeleton-line skeleton-hero-title"></div>
        <div className="skeleton-line skeleton-hero-text"></div>
        <div className="skeleton-line skeleton-hero-text short"></div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="skeleton-page">
      <HeroSkeleton />
      <div className="skeleton-section">
        <div className="skeleton-line skeleton-section-title"></div>
        <ProductRowSkeleton count={4} />
      </div>
      <div className="skeleton-section">
        <div className="skeleton-line skeleton-section-title"></div>
        <ProductRowSkeleton count={4} />
      </div>
    </div>
  );
}
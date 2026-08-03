import React from 'react'
import './PageStyles.css'
import mission from '../../assets/mission.png';
import offer from '../../assets/offer.png';
import star from '../../assets/star.png';

function AboutPage() {
  return (
    <div className="info-page">
      <h1>About Zenthora</h1>
      <p className="subtitle">Your premium entertainment marketplace</p>

      <div className="highlight-box">
        <p>Zenthora brings together Movies, Books, Manga, and Comics in one seamless platform — making entertainment accessible, affordable, and enjoyable for everyone.</p>
      </div>

      <div className="section-card mission">
        <div className="mission-header">
            <img className='card-icon mission' src={mission} alt="mission" />
            <h3>Our Mission</h3>
        </div>
        <p>To create the ultimate destination where entertainment lovers can discover, explore, and purchase their favorite content — from Hollywood blockbusters to Japanese manga, from bestselling novels to iconic comic books.</p>
      </div>

      <div className="section-card offer">
        <div className="offer-header">
            <img className='card-icon offer' src={offer} alt="offer" />
            <h3> What We Offer</h3>
        </div>
        <ul>
          <li><strong>Movies</strong> — Latest releases from top studios worldwide</li>
          <li><strong>Books</strong> — Bestselling titles across all genres</li>
          <li><strong>Manga</strong> — Popular series from Japan's finest creators</li>
          <li><strong>Comics</strong> — Classic and modern issues from Marvel, DC, and more</li>
        </ul>
      </div>

      <div className="section-card choose">
        <div className="choose-header">
            <img className='card-icon choose' src={star} alt="star" />
            <h3> Why Choose Zenthora</h3>
        </div>
        
        <ul>
          <li>All your entertainment in one place</li>
          <li>Competitive pricing in Nigerian Naira (₦)</li>
          <li>Fast and reliable delivery nationwide</li>
          <li>Secure payment processing</li>
          <li>Dedicated customer support team</li>
        </ul>
      </div>

      <div className="highlight-box">
        <p>Founded in 2026, Zenthora is proudly Nigerian, serving entertainment lovers across the country and beyond. We're committed to bringing the world's best content right to your doorstep.</p>
      </div>
    </div>
  )
}

export default AboutPage
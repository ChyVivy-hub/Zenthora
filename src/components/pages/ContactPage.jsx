import React, { useState } from 'react'
import clock from '../../assets/clock2.png';
import location from '../../assets/location.png';
import telephone from '../../assets/telephone.png';
import email from '../../assets/email.png';
import message from '../../assets/message.png';
import './PageStyles.css'

function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    e.target.reset()
  }

  return (
    <div className="info-page">
      <h1>Contact Us</h1>
      <p className="subtitle">We'd love to hear from you</p>

      <div className="contact-grid">
        <div>
          <div className="contact-card">
            <img className='card-icon email' src={email} alt="Email" />
            <div>
              <h4>Email Us</h4>
              <p>support@zenthora.com</p>
            </div>
          </div>

          <div className="contact-card">
            <img className='card-icon phone' src={telephone} alt="Phone" />
            <div>
              <h4>Call Us</h4>
              <p>+234 800 000 0000</p>
            </div>
          </div>

          <div className="contact-card">
            <img className='card-icon location' src={location} alt="Location" />
            <div>
              <h4>Visit Us</h4>
              <p>Lagos, Nigeria</p>
            </div>
          </div>

          <div className="contact-card">
            <img className='card-icon hours' src={clock} alt="Business Hours" />
            <div>
              <h4>Business Hours</h4>
              <p>Mon-Fri: 9AM-6PM | Sat: 10AM-4PM</p>
            </div>
          </div>
        </div>

        <div className="section-card contact">
          <h3>💬 Send a Message</h3>
          {sent && <div className="success-msg">Message sent! We'll respond within 24 hours.</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" placeholder="Your Full Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email Address" required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Subject" required />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="5" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
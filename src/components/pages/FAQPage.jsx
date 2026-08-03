import React, { useState } from 'react'
import './PageStyles.css'

function FAQPage() {
  const [open, setOpen] = useState(null)

  const faqs = [
    { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details and complete payment securely.' },
    { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards and bank transfers. All payments are processed through secure channels.' },
    { q: 'How long does delivery take?', a: 'Delivery within Nigeria takes 2-5 business days. International shipping takes 7-21 business days depending on your location.' },
    { q: 'Can I return a product?', a: 'Yes, returns are accepted within 14 days of delivery for damaged or incorrect items. Products must be in original condition.' },
    { q: 'How do I track my order?', a: 'Login to your account and visit the Dashboard to view your order status. You can also contact our support team.' },
    { q: 'Are the products genuine?', a: 'Absolutely. All products are sourced from authorized distributors. We guarantee 100% authentic products.' },
    { q: 'How do I become a staff member?', a: 'Visit the staff registration page at /staff-login and submit your application. Management will review and approve qualified candidates.' },
    { q: 'Is my personal information secure?', a: 'Yes. We use industry-standard encryption. Your data is never shared with third parties.' },
    { q: 'Do you offer bulk purchases?', a: 'Yes! Contact our support team for bulk order discounts and special pricing.' },
  ]

  return (
    <div className="info-page">
      <h1>FAQ</h1>
      <p className="subtitle">Frequently asked questions</p>

      <div className="highlight-box">
        <p>Can't find what you're looking for? Contact our support team — we're happy to help!</p>
      </div>

      {faqs.map((faq, i) => (
        <div key={i} className="faq-item">
          <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
            {faq.q}
            <span>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <p className="faq-answer">{faq.a}</p>}
        </div>
      ))}
    </div>
  )
}

export default FAQPage
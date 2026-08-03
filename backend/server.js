const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')
const dotenv = require('dotenv')
const nodemailer = require('nodemailer')

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const app = express()

app.use(cors())
app.use(express.json())

// =============================================
// EMAIL TRANSPORTER (Gmail)
// =============================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: 'chiomavivi119@gmail.com',
    pass: 'qxqw qtoc njtm dmfr',
  },
})

// =============================================
// HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// =============================================
// STRIPE CHECKOUT SESSION
// =============================================
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, total, email, currency = 'usd', selectedCountry } = req.body

    console.log('📦 Received items:', JSON.stringify(items, null, 2))

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    const lineItems = items.map((item, index) => {
      let name = item.title || item.name || item.product_name || ''
      if (!name || !name.trim()) {
        name = `Item ${index + 1}`
      }

      let description = item.category || item.description || ''
      if (description.trim() === '') {
        description = undefined
      }

      const price = parseFloat(item.price) || 0
      const qty = parseInt(item.qty) || 1

      console.log(`📦 Item ${index + 1}: "${name}", Price: ${price}, Qty: ${qty}`)

      const priceData = {
        currency: currency,
        product_data: {
          name: name.trim(),
        },
        unit_amount: Math.round(price * 100),
      }

      if (description) {
        priceData.product_data.description = description
      }

      return {
        price_data: priceData,
        quantity: qty,
      }
    })

    const calculatedTotal = lineItems.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity)
    }, 0) / 100

    const finalTotal = parseFloat(total) || calculatedTotal

    if (finalTotal < 0.50) {
      return res.status(400).json({ error: 'Amount too low. Minimum is $0.50.' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=true`,
      customer_email: email,
      metadata: {
        country: selectedCountry || 'International',
        items_count: String(items.length),
      },
    })

    console.log(`✅ Session created: ${session.id}`)

    res.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('❌ Stripe error:', error)
    res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    })
  }
})

// =============================================
// EMAIL: ORDER CONFIRMATION
// =============================================
app.post('/api/send-order-confirmation', async (req, res) => {
  console.log('📨 Received order confirmation request:', req.body)

  const { to, name, orderId, total, items, status } = req.body

  if (!to || !to.includes('@')) {
    console.warn('⚠️ Skipping confirmation email – invalid email:', to)
    return res.json({ success: false, message: 'Invalid email' })
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₦${parseFloat(item.price).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₦${(parseFloat(item.price) * item.qty).toLocaleString()}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #f84750; text-align: center;">🛍️ Zenthora</h1>
      <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
      <p style="color: #555; font-size: 16px;">Hi ${name},</p>
      <p style="color: #555; font-size: 16px;">Thank you for your order! We're processing it now.</p>
      <div style="background: white; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> <span style="color: #f84750; font-weight: bold;">${status}</span></p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <h3 style="color: #333;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f84750; color: white;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Grand Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd; color: #f84750;">₦${parseFloat(total).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background: white; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #333;">What's Next?</h4>
        <p style="color: #555; font-size: 14px;">We'll notify you when your order status changes. You can also track your order anytime in your <a href="${process.env.CLIENT_URL}/#/dashboard" style="color: #f84750;">dashboard</a>.</p>
      </div>
      <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">© 2026 Zenthora. All rights reserved.</p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Zenthora" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Order #${orderId} Confirmed – Zenthora`,
      html,
    })
    console.log('✅ Confirmation email sent to:', to, info.messageId)
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Email error:', error)
    res.status(500).json({ error: error.message })
  }
})

// =============================================
// EMAIL: ORDER STATUS UPDATE
// =============================================
app.post('/api/send-status-update', async (req, res) => {
  console.log('📨 Received status update request:', req.body)

  const { to, name, orderId, status, previousStatus } = req.body

  if (!to || !to.includes('@')) {
    console.warn('⚠️ Skipping status email – invalid email:', to)
    return res.json({ success: false, message: 'Invalid email' })
  }

  const statusMessages = {
    pending: 'Your order has been received and is awaiting confirmation.',
    confirmed: 'Your order has been confirmed and is being prepared.',
    shipped: 'Your order has been shipped and is on its way! 🚚',
    delivered: 'Your order has been delivered. Enjoy! 🎉',
    cancelled: 'Your order has been cancelled.',
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #f84750; text-align: center;">🛍️ Zenthora</h1>
      <h2 style="color: #333; text-align: center;">Order Status Update</h2>
      <p style="color: #555; font-size: 16px;">Hi ${name},</p>
      <p style="color: #555; font-size: 16px;">Your order <strong>#${orderId}</strong> has been updated.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #888;">Previous Status</p>
        <p style="font-size: 18px; color: #888;">${previousStatus}</p>
        <p style="font-size: 24px; color: #f84750; margin: 8px 0;">➜</p>
        <p style="font-size: 14px; color: #888;">New Status</p>
        <p style="font-size: 24px; font-weight: bold; color: #f84750; text-transform: uppercase;">${status}</p>
        <p style="color: #555; margin-top: 8px;">${statusMessages[status] || ''}</p>
      </div>
      <p style="color: #555; font-size: 14px;">You can track your order anytime in your <a href="${process.env.CLIENT_URL}/#/dashboard" style="color: #f84750;">dashboard</a>.</p>
      <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">© 2026 Zenthora. All rights reserved.</p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Zenthora" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Order #${orderId} – Status Updated to ${status}`,
      html,
    })
    console.log('✅ Status email sent to:', to, info.messageId)
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Email error:', error)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`)
})
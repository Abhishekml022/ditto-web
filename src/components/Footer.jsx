import logo from '../assets/images/Logo.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        <div className="site-footer__brand">
          <img src={logo} alt="Ditto" className="site-footer__logo" />
          <p className="site-footer__tagline">
            Generate legally structured rental agreements in minutes.
          </p>
          <p className="site-footer__contact">
            <a href="mailto:support@ditto.in">support@ditto.in</a>
          </p>
          <p className="site-footer__contact">
            Thiruvananthapuram, Kerala, India
          </p>
          <p className="site-footer__contact">
            <a href="https://www.goditto.in" target="_blank" rel="noreferrer">www.goditto.in</a>
          </p>
        </div>

        <div className="site-footer__links-group">
          <div className="site-footer__col">
            <div className="site-footer__col-title">Product</div>
            <a href="/agreement-formats">Agreement Formats</a>
            <a href="/orders">My Orders</a>
            <a href="/saved-details">Saved Orders</a>
          </div>

          <div className="site-footer__col">
            <div className="site-footer__col-title">Legal</div>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/refund-policy">Cancellation &amp; Refund</a>
            <a href="/shipping-policy">Shipping Policy</a>
          </div>

          <div className="site-footer__col">
            <div className="site-footer__col-title">Support</div>
            <a href="mailto:support@ditto.in">Contact Us</a>
            <a href="mailto:support@ditto.in">Report an Issue</a>
          </div>
        </div>

      </div>

      <div className="site-footer__bottom">
        <span>© {year} Ditto. All rights reserved.</span>
        <span className="site-footer__bottom-note">
          Payments secured by Razorpay · GST applicable as per Indian law
        </span>
      </div>
    </footer>
  )
}

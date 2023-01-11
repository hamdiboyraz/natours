import stripe_token from './stripe_token.js';
import { showAlert } from './alert.js';

const stripe = Stripe(stripe_token);

export const bookTour = async (tourID) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

const bookBtn = document.getElementById('book-tour');
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId; // const {tourId = e.target.dateset}
    bookTour(tourId);
  });

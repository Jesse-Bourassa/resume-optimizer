// routes/stripe.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 500, // $5.00
            product_data: {
              name: "Resume Optimizer Premium",
            },
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.log("🔑 Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY?.slice(0, 8));
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});


// Route to check subscription status
router.get("/check-subscription", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid" && session.mode === "subscription") {
      const customerId = session.customer;

      // Load Firebase Admin
      const admin = require("firebase-admin");
      if (!admin.apps.length) {
        const serviceAccount = require("../../../firebase-service-account.json"); // <-- Replace with actual path

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      // Retrieve customer email from Stripe
      const customer = await stripe.customers.retrieve(customerId);
      const userEmail = customer.email;

      try {
        const user = await admin.auth().getUserByEmail(userEmail);
        await admin.auth().setCustomUserClaims(user.uid, { isSubscribed: true });
      } catch (firebaseErr) {
        console.error("Error updating Firebase user subscription:", firebaseErr);
        return res.status(500).json({ error: "Failed to update subscription status in Firebase" });
      }

      // You can also store this info to your database or Firebase here
      // For now, we simply return a success message
      return res.status(200).json({
        message: "Subscription is active",
        customerId,
        subscriptionId: session.subscription,
      });
    } else {
      return res.status(400).json({ error: "Subscription not active" });
    }
  } catch (err) {
    console.error("Stripe check-subscription error:", err);
    return res.status(500).json({ error: "Failed to verify subscription" });
  }
});

module.exports = router;
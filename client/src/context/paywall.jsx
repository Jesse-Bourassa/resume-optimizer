import React from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Replace with your Stripe public key
const stripePromise = loadStripe("pk_test_51RLD2IFZLX78Yx5DP12LJhicKDcEd2GyXGJnC7g9px8Ymu0tHjv4dX9DkK5nERy2ztv8Ovef5EzA4dKteXb8NVgw00RlPH15k3");

const subscribeWithStripe = async () => {
  const stripe = await stripePromise;

  try {
    const session = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: "monthly_5" }),
    }).then((res) => res.json());

    if (session.id) {
      // Store session ID for verification after redirect
      localStorage.setItem("stripeSessionId", session.id);
      stripe.redirectToCheckout({ sessionId: session.id });
    } else {
      alert("Failed to start checkout.");
    }
  } catch (error) {
    console.error("Stripe checkout error:", error);
    alert("Something went wrong during checkout.");
  }
};

const PaywallModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 360,
          bgcolor: "#1a1a1a",
          color: "#f0f0f0",
          border: "2px solid #00ffe7",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1.5, color: "#00ffe7", textShadow: "0 0 6px #00ffe7" }}>
          Premium Access
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, px: 1 }}>
          Unlock resume analysis for just $5/month. Help us cover compute costs and continue improving the app.
        </Typography>
        <Box
          sx={{
            border: "1px solid #00ffe7",
            borderRadius: 2,
            p: 3,
            background: "#1f1f1f",
          }}
        >
          <Typography variant="h5" sx={{ color: "#00ffe7", mb: 1 }}>
            $5<span style={{ fontSize: "0.9rem" }}>/month</span>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic", color: "#ccc" }}>
            Full access to resume analysis
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: "#00d26a", "&:hover": { backgroundColor: "#00a95c" } }}
            onClick={subscribeWithStripe}
          >
            Subscribe Now
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PaywallModal;
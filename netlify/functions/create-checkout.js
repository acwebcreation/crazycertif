// netlify/functions/create-checkout.js
// Crée une session Stripe Checkout : 5€ pour 1 style, 12€ pour 3.
// Les styles choisis sont stockés dans les metadata de la session Stripe,
// pas dans une base de données — pas besoin de compte utilisateur.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "https://crazycertif.com";

const PRICES = {
  1: { amount: 500, label: "1 certificat CrazyCertif" },   // 5,00 €
  3: { amount: 1200, label: "Pack de 3 certificats CrazyCertif" }, // 12,00 €
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  const { count, styles } = body;
  const pricing = PRICES[count];

  if (!pricing || !Array.isArray(styles) || styles.length !== count) {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_selection" }) };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: pricing.label },
            unit_amount: pricing.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        styles: styles.join(","),
        count: String(count),
      },
      success_url: `${SITE_URL}/personalize.html?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/index.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe checkout error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "stripe_error" }) };
  }
}

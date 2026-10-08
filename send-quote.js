const twilio = require("twilio");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "POST required" });
  }

  try {
    const { name, phone, services, notes } = req.body || {};

    if (!name || !phone || !services) {
      return res.status(400).json({
        success: false,
        error: "Name, phone, and services are required."
      });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = [
      "RNT Detail - New Quote Request",
      `Name: ${name}`,
      `Customer phone: ${phone}`,
      `Services: ${services}`,
      notes ? `Notes: ${notes}` : ""
    ].filter(Boolean).join("\n");

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.BUSINESS_PHONE
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Unable to send the quote request."
    });
  }
};
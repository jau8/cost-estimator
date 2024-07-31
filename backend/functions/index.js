const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_CREDENTIALS)),
});

const app = express();
app.use(cors({origin: true}));
app.use(express.json()); // To parse JSON bodies

// Endpoint to estimate cost and price
app.post("/estimate", (req, res) => {
  try {
    const {items} = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({error: "Items array is required"});
    }

    let totalCost = 0;
    let totalPrice = 0;
    const detailedItems = {
      labor: [],
      materials: [],
      equipment: [],
    };

    items.forEach((item) => {
      const {type, name, units, time, rate, margin} = item;

      const itemUnits = parseFloat(units) || 0;
      const itemTime = type === "materials" ? 1 : parseFloat(time) || 0;
      const itemRate = parseFloat(rate) || 0;
      const itemMargin = parseFloat(margin) || 0;

      const cost = itemUnits * itemTime * itemRate;
      const price = cost / (1 - itemMargin / 100);

      totalCost += cost;
      totalPrice += price;

      const detailedItem = {
        name,
        units: itemUnits,
        time: itemTime,
        rate: itemRate,
        margin: itemMargin,
        cost,
        price,
      };

      detailedItems[type].push(detailedItem);
    });

    res.json({
      detailedItems,
      totalCost,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

exports.api = functions.https.onRequest(app);

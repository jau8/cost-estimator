const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// Endpoint to estimate cost and price
app.post("/estimate", async (req, res) => {
  console.log("POST /estimate");
  try {
    const {items} = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({error: "Items array is required"});
    }

    let totalCost = 0;
    let totalPrice = 0;
    const detailedItems = {labor: [], materials: [], equipment: []};

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

    const estimate = {
      detailedItems,
      totalCost,
      totalPrice,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log("Estimate complete:", estimate);
    res.json(estimate);
  } catch (error) {
    console.error("Error calculating estimate:", error);
    res.status(500).json({error: error.message});
  }
});

app.post("/save-estimate", async (req, res) => {
  console.log("POST /save-estimate");
  try {
    const {customerId, estimate} = req.body;

    console.log("Customer ID:", customerId);
    console.log("Estimate Data:", estimate);

    // Validate inputs
    if (!customerId || !estimate) {
      return res.status(400)
          .json({error: "customerId and estimate are required"});
    }

    // Generate a new estimate ID
    const estimateDoc = db.collection("customers")
        .doc(customerId).collection("estimates").doc();
    await estimateDoc.set(estimate);

    res.json({success: true, estimateId: estimateDoc.id});
  } catch (error) {
    console.error("Error saving estimate:", error);
    res.status(500).json({error: error.message});
  }
});

app.get("/estimate/:customerId/:estimateId", async (req, res) => {
  console.log("GET /estimate/:customerId/:estimateId");
  try {
    const {customerId, estimateId} = req.params;
    console.log("Customer ID:", customerId);
    console.log("Estimate ID:", estimateId);

    const estimateDoc = await db.collection("customers")
        .doc(customerId).collection("estimates").doc(estimateId).get();

    if (!estimateDoc.exists) {
      return res.status(404).json({error: "Estimate not found"});
    }

    res.json({id: estimateDoc.id, ...estimateDoc.data()});
  } catch (error) {
    console.error("Error retrieving estimate:", error);
    res.status(500).json({error: error.message});
  }
});

app.put("/update-estimate", async (req, res) => {
  console.log("PUT /update-estimate");
  try {
    const {customerId, estimateId, estimate} = req.body;
    console.log("Customer ID:", customerId);
    console.log("Estimate ID:", estimateId);
    console.log("Estimate Data:", estimate);

    if (!customerId || !estimateId || !estimate) {
      return res.status(400)
          .json({error: "Customer ID, Estimate ID, and Estimate are required"});
    }

    const customerDoc = db.collection("customers").doc(customerId);
    const estimateDoc = customerDoc.collection("estimates").doc(estimateId);

    await estimateDoc.update(estimate);
    console.log("Estimate updated successfully");

    res.json({success: true});
  } catch (error) {
    console.error("Error updating estimate:", error);
    res.status(500).json({error: error.message});
  }
});

app.delete("/delete-estimate", async (req, res) => {
  console.log("DELETE /delete-estimate");
  try {
    const {customerId, estimateId} = req.body;
    console.log("Customer ID:", customerId);
    console.log("Estimate ID:", estimateId);

    if (!customerId || !estimateId) {
      return res.status(400)
          .json({error: "Customer ID and Estimate ID are required"});
    }

    const customerDoc = db.collection("customers").doc(customerId);
    const estimateDoc = customerDoc.collection("estimates").doc(estimateId);

    await estimateDoc.delete();
    console.log("Estimate deleted successfully");

    res.json({success: true});
  } catch (error) {
    console.error("Error deleting estimate:", error);
    res.status(500).json({error: error.message});
  }
});

app.get("/estimates/:customerId", async (req, res) => {
  console.log("GET /estimates/:customerId");
  try {
    const {customerId} = req.params;
    console.log("Customer ID:", customerId);

    const estimatesSnapshot = await db.collection("customers")
        .doc(customerId).collection("estimates").get();
    const estimates = [];

    estimatesSnapshot.forEach((doc) => {
      estimates.push({id: doc.id, ...doc.data()});
    });

    res.json(estimates);
  } catch (error) {
    console.error("Error retrieving estimates for customer:", error);
    res.status(500).json({error: error.message});
  }
});

app.post("/add-customer", async (req, res) => {
  console.log("POST /add-customer");
  try {
    const {name, address} = req.body;
    console.log("Customer Data:", {name, address});

    if (!name || !address) {
      return res.status(400).json({error: "Name and address are required"});
    }

    const customer = {name, address};
    const docRef = await db.collection("customers").add(customer);
    console.log("Customer added with ID:", docRef.id);

    res.json({success: true, id: docRef.id});
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({error: error.message});
  }
});

app.get("/customers", async (req, res) => {
  console.log("GET /customers");
  try {
    const customersSnapshot = await db.collection("customers").get();
    const customers = [];

    customersSnapshot.forEach((doc) => {
      customers.push({id: doc.id, ...doc.data()});
    });

    res.json(customers);
  } catch (error) {
    console.error("Error retrieving customers:", error);
    res.status(500).json({error: error.message});
  }
});

app.put("/update-customer", async (req, res) => {
  console.log("PUT /update-customer");
  try {
    const {customerId, customerData} = req.body;
    console.log("Customer ID:", customerId);
    console.log("Customer Data:", customerData);

    if (!customerId || !customerData) {
      return res.status(400)
          .json({error: "Customer ID and customer data are required"});
    }

    const customerDoc = db.collection("customers").doc(customerId);
    await customerDoc.update(customerData);
    console.log("Customer updated successfully");

    res.json({success: true});
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({error: error.message});
  }
});

app.delete("/delete-customer", async (req, res) => {
  try {
    const {customerId} = req.body;

    const customerDoc = db.collection("customers").doc(customerId);
    const estimatesSnapshot = await customerDoc.collection("estimates").get();

    // Delete all estimates associated with the customer
    const batch = db.batch();
    estimatesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await customerDoc.delete();

    res.json({success: true});
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({error: error.message});
  }
});

exports.api = functions.https.onRequest(app);

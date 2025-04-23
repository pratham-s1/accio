const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

exports.analyzeImage = functions.https.onRequest(async (req, res) => {
  try {
    const base64Image = req.body.image;
    if (!base64Image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Analyze this image of a lost item and return JSON with 
    predicted fields: itemName, category, color, brandName. 
    Example: {"itemName": "Wallet", "category": "Accessories", 
    "color": "Black", "brandName": "Gucci"}`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const responseText = result.response.text();
    // Clean up response (remove code fences if present)
    const cleanedText = responseText.replace(/```json\n|\n```/g, "").trim();
    const predictedFields = JSON.parse(cleanedText);

    res.status(200).json(predictedFields);
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});
exports.placeBid = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }
  try {
    const { itemId, bidAmount, bidderName, userId } = req.body;
    if (!itemId || !bidAmount || !bidderName || !userId) {
      throw new Error("Missing required fields");
    }
    // Add bid logic here (e.g., update Firestore)
    await admin.firestore().collection("bids").doc(itemId).set(
      {
        amount: bidAmount,
        bidderName: bidderName,
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

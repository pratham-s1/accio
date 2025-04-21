const functions = require("firebase-functions");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

exports.analyzeImage = functions.https.onRequest(async (req, res) => {
  try {
    const base64Image = req.body.image;
    if (!base64Image) {
      return res.status(400).json({error: "No image provided"});
    }

    const model = genAI.getGenerativeModel({model: "gemini-1.5-pro"});

    const prompt = `Analyze this image of a lost item and return JSON with 
    predicted fields: itemName, category, color, brandName. 
    Example: {"itemName": "Wallet", "category": "Accessories", 
    "color": "Black", "brandName": "Gucci"}`;
    const result = await model.generateContent([
      prompt,
      {inlineData: {data: base64Image, mimeType: "image/jpeg"}},
    ]);

    const responseText = result.response.text();
    // Clean up response (remove code fences if present)
    const cleanedText = responseText.replace(/```json\n|\n```/g, "").trim();
    const predictedFields = JSON.parse(cleanedText);

    res.status(200).json(predictedFields);
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({error: "Failed to analyze image"});
  }
});

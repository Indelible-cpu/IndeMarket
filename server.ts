import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini API Endpoint for Related Products Recommendation
  app.post("/api/related-products", async (req, res) => {
    const { currentProduct, candidateProducts } = req.body || {};
    if (!currentProduct) {
      return res.status(400).json({ error: "Missing currentProduct parameter" });
    }

    const fallbackResponse = () => {
      const categoryMatches = (candidateProducts || [])
        .filter((p: any) => p.id !== currentProduct.id)
        .filter((p: any) => p.category === currentProduct.category)
        .slice(0, 4);

      return res.json({
        summaryInsight: `Top trending selections in ${currentProduct.category || 'Marketplace'}`,
        recommendations: categoryMatches.map((p: any) => ({
          productId: p.id,
          reason: `Popular choice in ${currentProduct.category || 'this collection'}`,
          matchScore: 85
        })),
        aiGenerated: false
      });
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey.includes("MY_GEMINI_API_KEY")) {
        return fallbackResponse();
      }

      const ai = new GoogleGenAI({ apiKey });

      const catalogSummary = (candidateProducts || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description ? p.description.substring(0, 160) : "",
        tags: p.tags || []
      }));

      const prompt = `You are an intelligent e-commerce recommendation engine for the IndeMarket marketplace.
A user is currently viewing the following product:
- Product Name: "${currentProduct.name}"
- Category: "${currentProduct.category}"
- Price: $${currentProduct.price}
- Description: "${currentProduct.description || 'No description provided.'}"
- Tags: ${JSON.stringify(currentProduct.tags || [])}

Analyze the current product's category, purpose, target audience, and description. Then review the candidate products catalog below and pick the top 4 most relevant related products.
Selection criteria:
1. High category relevance or direct complementary pairing.
2. Output a concise 1-sentence explanation why it connects with the current product.
3. Assign a match score percentage (integer between 78 and 98).

Candidate Catalog:
${JSON.stringify(catalogSummary, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryInsight: {
                type: Type.STRING,
                description: "A single concise overview sentence explaining why these items fit with the current product."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: {
                      type: Type.STRING,
                      description: "The exact ID of the recommended candidate product"
                    },
                    reason: {
                      type: Type.STRING,
                      description: "A catchy 1-sentence reason why this product relates to the viewed item"
                    },
                    matchScore: {
                      type: Type.NUMBER,
                      description: "Match percentage score between 75 and 99"
                    }
                  },
                  required: ["productId", "reason", "matchScore"]
                }
              }
            },
            required: ["summaryInsight", "recommendations"]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText);

      return res.json({
        summaryInsight: parsed.summaryInsight || `AI Recommendations matching ${currentProduct.category}`,
        recommendations: parsed.recommendations || [],
        aiGenerated: true
      });
    } catch (_err) {
      // Return structured fallback recommendations seamlessly without crashing or throwing
      return fallbackResponse();
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

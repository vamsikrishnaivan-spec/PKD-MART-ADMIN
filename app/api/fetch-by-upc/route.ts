import { NextResponse } from "next/server"
import axios from  "axios"

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions"
const API_KEY = process.env.PERPLEXITY_API_KEY

export async function POST(req: Request) {
  const { upc } = await req.json()

  if (!upc) {
    return NextResponse.json({ error: "UPC required" }, { status: 400 })
  }

  try {
    const response = await axios.post(
        PERPLEXITY_API,
        {
            model: "sonar-pro", // or "llama-3.1-sonar-large"
            messages: [
                {
                    role: "user",
                    content: `
                    Return ONLY valid JSON for the product with UPC in India: ${upc}.
                    Include:
                    upc, name, brand, category, subcategory, manufacturer, model, description,
                    specifications (key-value pairs),
                    pricing (with mrp, sellingPrice, currency "INR", available, lastUpdated),
                    images (array), and sources (array of URLs).
                    
                    ⚠️ Important:
                    - The category must be one of the following: "fruits", "dairy", "essentials", or "snacks".
                    - If the product does not belong to these categories, set the category to "essentials".
                    - Do not include any text outside the JSON.
                    - The response must be valid JSON only (no markdown, comments, or extra text).
                    `,
                },
            ],
            temperature: 0.2,
        },
        {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    )
    let content = response.data.choices[0].message?.content || ""

    // 🧹 Strip Markdown fences like ```json ... ```
    content = content.replace(/```json|```/g, "").trim()

    let product
    try {
      product = JSON.parse(content)
    } catch (parseError) {
      console.error("JSON parse failed:", parseError)
      console.log("Raw content:", content)
      return NextResponse.json({ error: "Failed to parse model JSON" }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { callClaude } from '@/lib/claude'

export async function POST(req) {
  const { income, unavoidable, avoidable, savings } = await req.json()

  const prompt = `You are a personal finance advisor for a young Indian user.
Income: Rs ${income}, Unavoidable expenses: Rs ${unavoidable},
Avoidable expenses: Rs ${avoidable}, Monthly savings: Rs ${savings}.
Give exactly 3 investment suggestions and 3 ways to reduce avoidable expenses.
Keep each point under 2 lines. Be specific and practical.
Format as JSON: { "suggestions": [{ "type": "investment" or "saving",
"title": "short title", "desc": "one line description" }] }`

  try {
    const response = await callClaude(prompt)
    const clean = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch (error) {
    return Response.json({ suggestions: [] }, { status: 500 })
  }
}

import { callAI } from '@/lib/claude'

export async function POST(req) {
  const { expenses } = await req.json()

  if (!expenses || expenses.length === 0) {
    return Response.json([])
  }

  const prompt = `You are a personal finance
categorizer for Indian users.

Categorize each expense as avoidable or unavoidable.

Rules:
unavoidable = rent, electricity, water, gas,
medicine, school fees, EMI, insurance,
transport to work, groceries, internet,
mobile recharge, utility bills

avoidable = dining out, zomato, swiggy,
movies, shopping, games, OTT subscriptions,
salon, junk food, accessories, gadgets,
entertainment, cafe, coffee, alcohol

Expenses:
${expenses.map((e, i) =>
  `${i + 1}. ${e.title}: Rs ${e.amount}`
).join('\n')}

Return ONLY a JSON array, no extra text, no markdown:
[{"title":"name","amount":0,"category":"avoidable or unavoidable","reason":"one line"}]`

  try {
    const response = await callAI(prompt)
    const clean = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const start = clean.indexOf('[')
    const end = clean.lastIndexOf(']') + 1
    const jsonStr = clean.slice(start, end)
    const parsed = JSON.parse(jsonStr)

    return Response.json(parsed)

  } catch (error) {
    console.error('Groq categorize failed:', error.message)

    const unavoidableKeywords = [
      'rent', 'electricity', 'bill', 'water', 'gas',
      'medicine', 'medical', 'school', 'fees', 'emi',
      'insurance', 'transport', 'grocery', 'groceries',
      'internet', 'mobile', 'recharge', 'travel',
      'petrol', 'diesel', 'bus', 'train', 'metro'
    ]

    const fallback = expenses.map(e => {
      const titleLower = e.title.toLowerCase()
      const isUnavoidable = unavoidableKeywords
        .some(k => titleLower.includes(k))
      return {
        title: e.title,
        amount: e.amount,
        category: isUnavoidable
          ? 'unavoidable' : 'avoidable',
        reason: isUnavoidable
          ? 'Essential expense that cannot be avoided'
          : 'Lifestyle expense that can be reduced'
      }
    })

    return Response.json(fallback)
  }
}

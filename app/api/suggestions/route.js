import { callGemini as callAI } from '@/lib/gemini'

export async function POST(req) {
  const {
    income, unavoidable, avoidable,
    savings, expenses
  } = await req.json()

  const expenseList = expenses
    .map(e => `${e.title}: Rs ${e.amount} (${e.type})`)
    .join(', ')

  const prompt = `You are a personal finance advisor for a young Indian user.
Their financial data:
- Monthly Income: Rs ${income}
- Unavoidable Expenses: Rs ${unavoidable}
- Avoidable Expenses: Rs ${avoidable}
- Monthly Savings: Rs ${savings}
- Expense breakdown: ${expenseList}

Based on their ACTUAL spending give:
1. Three specific investment suggestions based on their savings amount
2. Three specific ways to reduce their actual avoidable expenses

Be very specific to their actual expenses listed above.
Do not give generic advice.
Keep each point under 2 lines.

Return ONLY this JSON format, no extra text:
{
  "suggestions": [
    {
      "type": "investment",
      "title": "short title",
      "desc": "specific advice based on their data"
    },
    {
      "type": "investment",
      "title": "short title",
      "desc": "specific advice based on their data"
    },
    {
      "type": "investment",
      "title": "short title",
      "desc": "specific advice based on their data"
    },
    {
      "type": "saving",
      "title": "short title",
      "desc": "specific advice based on their data"
    },
    {
      "type": "saving",
      "title": "short title",
      "desc": "specific advice based on their data"
    },
    {
      "type": "saving",
      "title": "short title",
      "desc": "specific advice based on their data"
    }
  ]
}`

  try {
    const response = await callAI(prompt)
    const clean = response
      .replace(/```json|```/g, '')
      .trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch (error) {
    console.error('AI error:', error)
    return Response.json({
      suggestions: [
        {
          type: 'investment',
          title: 'Start SIP',
          desc: `With Rs ${savings} savings, start a monthly SIP in index funds.`
        },
        {
          type: 'saving',
          title: 'Review Expenses',
          desc: `You spent Rs ${avoidable} on avoidable items. Try reducing by 20%.`
        }
      ]
    })
  }
}

import { callAI } from '@/lib/claude'

export async function POST(req) {
  const {
    income,
    unavoidable,
    avoidable,
    savings,
    expenses
  } = await req.json()

  if (!expenses || expenses.length === 0) {
    return Response.json({
      source: 'no-data',
      suggestions: [{
        type: 'saving',
        title: 'Add Your Expenses',
        desc: 'Start adding your daily expenses to get personalized AI suggestions.'
      }]
    })
  }

  // GROUP EXPENSES BY MONTH
  const monthlyGroups = expenses.reduce((acc, e) => {
    const month = new Date(e.date)
      .toLocaleString('default', {
        month: 'long', year: 'numeric'
      })
    if (!acc[month]) acc[month] = []
    acc[month].push(e)
    return acc
  }, {})

  // MONTHLY SPENDING SUMMARY
  const monthlySummary = Object.entries(monthlyGroups)
    .map(([month, exps]) => {
      const total = exps.reduce(
        (sum, e) => sum + Number(e.amount), 0
      )
      const avoidableExp = exps
        .filter(e => e.type === 'avoidable')
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const topExpenses = exps
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(e => `${e.title} Rs ${e.amount}`)
        .join(', ')
      return `${month}: Total Rs ${total}, Avoidable Rs ${avoidableExp}, Top: ${topExpenses}`
    })
    .join('\n')

  // CATEGORY BREAKDOWN
  const categoryBreakdown = expenses.reduce((acc, e) => {
    const cat = e.category || 'other'
    if (!acc[cat]) acc[cat] = 0
    acc[cat] += Number(e.amount)
    return acc
  }, {})

  const categoryList = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `${cat}: Rs ${amt}`)
    .join(', ')

  // REPEATED EXPENSES (habits)
  const expenseFrequency = expenses.reduce((acc, e) => {
    const key = e.title.toLowerCase()
    if (!acc[key]) acc[key] = { count: 0, total: 0, title: e.title }
    acc[key].count++
    acc[key].total += Number(e.amount)
    return acc
  }, {})

  const repeatedExpenses = Object.values(expenseFrequency)
    .filter(e => e.count > 1)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(e => `${e.title}: ${e.count} times, total Rs ${e.total}`)
    .join(', ')

  // AVOIDABLE EXPENSE PATTERN
  const avoidableList = expenses
    .filter(e => e.type === 'avoidable')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(e => `${e.title} Rs ${e.amount}`)
    .join(', ')

  // MOOD SPENDING PATTERN
  const moodSpending = expenses.reduce((acc, e) => {
    const mood = e.mood || 'neutral'
    if (!acc[mood]) acc[mood] = 0
    acc[mood] += Number(e.amount)
    return acc
  }, {})

  const moodPattern = Object.entries(moodSpending)
    .sort((a, b) => b[1] - a[1])
    .map(([mood, amt]) => `${mood}: Rs ${amt}`)
    .join(', ')

  const prompt = `You are an expert personal finance
architect specialized in helping users master their money.

FINANCIAL DATA:
- Monthly Income: Rs ${income}
- Total Unavoidable: Rs ${unavoidable}
- Total Avoidable: Rs ${avoidable}
- Current Monthly Savings: Rs ${savings}
- Savings Rate: ${income > 0 ? ((savings/income)*100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${categoryList}

MONTHLY SPENDING PATTERNS:
${monthlySummary}

REPEATED HABITS:
${repeatedExpenses || 'No repeated patterns yet'}

AVOIDABLE SPENDING (USE THESE FOR MISTAKES):
${avoidableList || 'No avoidable expenses yet'}

MOOD BASED SPENDING:
${moodPattern || 'No mood data yet'}

YOUR TASK:
Analyze the transaction intelligence and provide a structured JSON response.

1. PATTERN ANALYSIS:
   - Identify if the user is repeating spending mistakes month-to-month.
   - Point out which category is leaking the most money.
   - Identify if there are "habitual" expenses (repeated titles).

2. MOOD WARNING:
   - Precisely pinpoint if a specific mood triggers higher spending in AVOIDABLE categories.
   - Give 1 actionable rule for that mood.

3. BIGGEST MISTAKE (CRITICAL RULE):
   - Select the single most expensive habit or pattern from the AVOIDABLE list only.
   - NEVER, UNDER ANY CIRCUMSTANCE, flag Rent, Hostel, EMI, Tuition, Groceries, or Electricity as a "Mistake". These are survival costs.
   - A mistake is a high-frequency or high-amount spend on things like dining out, shopping, or non-essential subscriptions.

4. SUGGESTIONS (Provide exactly 6 items):
   - 3 Investment suggestions based on their savings.
   - 3 Saving suggestions based on their ACTUAL top avoidable expenses.

Rules:
- Use Rs only.
- Reference their exact expense names.
- Be practical and encouraging.
- Keep descriptions under 2 lines.

Return ONLY this JSON format:
{
  "patternAnalysis": "text analysis here",
  "biggestMistake": "single biggest mistake",
  "moodWarning": "mood correlation and rule",
  "suggestions": [
    {"type":"investment","title":"title","desc":"desc"},
    {"type":"investment","title":"title","desc":"desc"},
    {"type":"investment","title":"title","desc":"desc"},
    {"type":"saving","title":"title","desc":"desc"},
    {"type":"saving","title":"title","desc":"desc"},
    {"type":"saving","title":"title","desc":"desc"}
  ]
}`

  try {
    const response = await callAI(prompt)
    const clean = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}') + 1
    const jsonStr = clean.slice(start, end)
    const parsed = JSON.parse(jsonStr)
    return Response.json({ ...parsed, source: 'groq' })

  } catch (error) {
    console.error('Suggestions failed:', error.message)
    return Response.json({
      source: 'fallback',
      patternAnalysis: `You spend Rs ${avoidable} on avoidable items monthly. Your savings rate is ${income > 0 ? ((savings/income)*100).toFixed(1) : 0}%.`,
      biggestMistake: 'Generic spending on avoidable items.',
      moodWarning: 'Track your emotions before purchasing.',
      suggestions: [
        { type: 'investment', title: 'Start SIP', desc: 'Invest 30% of savings in Nifty 50.' },
        { type: 'investment', title: 'Emergency Fund', desc: 'Secure 3 months of basic expenses.' },
        { type: 'investment', title: 'Gold ETF', desc: 'Diversify with digital gold.' },
        { type: 'saving', title: 'Cut Avoidable', desc: 'Try cutting 10% of your top spending.' },
        { type: 'saving', title: 'Weekly Review', desc: 'Review every Sunday to save 20% more.' },
        { type: 'saving', title: 'Daily Limit', desc: 'Set a UPI limit for non-essentials.' }
      ]
    })
  }
}

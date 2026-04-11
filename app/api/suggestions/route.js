import { callAI } from '@/lib/claude'

export async function POST(req) {
  const {
    income,
    unavoidable,
    avoidable,
    savings,
    expenses,
    goal
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

  // REPEATED HABITS
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

  // AVOIDABLE EXPENSE LIST
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

  const prompt = `You are a world-class Financial Architect. 

USER DATA:
- Income: Rs ${income}
- Savings: Rs ${savings}
- Target Goal: Rs ${goal || 'Not set'}
- Top Avoidable Items: ${avoidableList}
- Repeated Habits: ${repeatedExpenses}

YOUR TASK:
Provide deep transaction analysis and "Goal-Accelerated" growth strategies.

1. PATTERN ANALYSIS: Identify specific spending habits leaking money.
2. MOOD WARNING: Identify mood-spending correlations.
3. BIGGEST MISTAKE: Identify the most expensive avoidable habit.

4. GROWTH STRATEGIES (Give 3 Investment, 3 Saving):
FOR EACH INVESTMENT ITEM:
- comparison: Calculate "Goal Acceleration". 
  Logic: "If you save the Rs [X] you spend monthly on [Habit] and put it in a [Product] SIP at 12%:
  - In 1 Year: Rs [Yearly_Total]
  - In 5 Years: Rs [5Year_Total]
  - Goal Impact: Achieve your Rs ${goal} goal approximately [N] months faster."
- links: Provide 1-2 verified URLs (sebi.gov.in, rbi.org.in, ncfe.org.in).

Rules:
- COMPOUND MATH: Assume the expense is saved EVERY MONTH. 
- Use Rs only. 
- NEVER flag Books, Education, Rent, or Health as a mistake.
- Be highly motivating and precise with numbers.

Return ONLY this JSON format:
{
  "patternAnalysis": "string",
  "biggestMistake": "string",
  "moodWarning": "string",
  "suggestions": [
    {
      "type": "investment",
      "title": "Strategy Name",
      "desc": "Benefit",
      "comparison": "The deep SIP + Goal math text",
      "links": [{"title": "Source", "url": "url"}]
    },
    ...
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
      patternAnalysis: `You spend Rs ${avoidable} on avoidable items monthly.`,
      biggestMistake: 'Generic spending on avoidable items.',
      moodWarning: 'Track your emotions before purchasing.',
      suggestions: [
        { type: 'investment', title: 'Nifty 50 SIP', desc: 'Secure long term growth.', comparison: 'Cutting Rs 500 on dining out could become Rs 41,000 in 5 years.', links: [{title: 'NSE Investor Guide', url: 'https://www.nseindia.com/invest/about-investing'}] },
        { type: 'investment', title: 'Debt Funds', desc: 'Low risk stability.', comparison: 'Your unused balance could grow at 7% in Debt funds.', links: [{title: 'SEBI Investor Portal', url: 'https://investor.sebi.gov.in/'}] },
        { type: 'investment', title: 'Digital Gold', desc: 'Diversify your portfolio.', comparison: 'Small gold SIPs are better than impulse shopping.', links: [{title: 'NCFE E-Learning', url: 'https://www.ncfe.org.in/'}] },
        { type: 'saving', title: 'Cut avoidable', desc: 'Focus on reducing the top 3 categories.' },
        { type: 'saving', title: 'Mood Check', desc: 'Wait 24h before shopping while excited.' },
        { type: 'saving', title: 'Subscription Check', desc: 'Audit recurring bills.' }
      ]
    })
  }
}

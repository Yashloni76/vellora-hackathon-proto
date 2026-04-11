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

  const prompt = `You are an expert personal finance wealth architect.

FINANCIAL DATA:
- Monthly Income: Rs ${income}
- Total Unavoidable: Rs ${unavoidable}
- Total Avoidable: Rs ${avoidable}
- Savings: Rs ${savings}

SPENDING BY CATEGORY: ${categoryList}
MONTHLY TRENDS: ${monthlySummary}
REPEATED HABITS: ${repeatedExpenses}
TOP AVOIDABLE ITEMS: ${avoidableList}
MOOD PATTERNS: ${moodPattern}

YOUR TASK:
Provide a deep analysis and smart growth strategies in JSON.

1. PATTERN ANALYSIS: Analyze monthly behavior vs income.
2. MOOD WARNING: Identify emotional spending triggers.
3. BIGGEST MISTAKE: Identify the most wasteful avoidable habit.

4. SUGGESTIONS (Provide 6 items: 3 Investment, 3 Saving):
FOR EACH INVESTMENT ITEM:
- comparison: Specifically say "You spent Rs X on [Avoidable Item] last month. If you invested this in [Product] at 12% returns, it would be Rs Y in 5 years."
- links: Provide 1-2 trusted Indian URLs.
  TRUSTED URLS TO USE:
  - SEBI Investor: https://investor.sebi.gov.in/
  - NCFE: https://www.ncfe.org.in/
  - RBI Education: https://rbi.org.in/scripts/BS_ViewFinancialEducation.aspx
  - NSE Investor: https://www.nseindia.com/invest/about-investing

Rules:
- NO generic advice. Use ACTUAL expense names from the data.
- Investment products must be Indian (SIP, MF, Index Funds, PPF, FD).
- Calculate growth correctly (12% CAGR is a good estimate).
- CRITICAL: Select the 'Biggest Mistake' ONLY from the Avoidable Spending list.
- CRITICAL: NEVER, UNDER ANY CIRCUMSTANCE, flag Rent, Hostel, EMI, Tuition, Books, Stationery, Learning, Groceries, or Health as a 'Mistake' or 'Waste'.
- CRITICAL: For young users, spending on BOOKS and EDUCATION is a high-reward investment in their future. Praise this, do not suggest cutting it for financial products.

Return JSON ONLY:
{
  "patternAnalysis": "text",
  "biggestMistake": "text",
  "moodWarning": "text",
  "suggestions": [
    {
      "type": "investment",
      "title": "Strategy Name",
      "desc": "How it helps",
      "comparison": "The wasteful spend vs growth text",
      "links": [{"title": "Official Guide", "url": "verified url"}]
    },
    ...3 total investment,
    {
      "type": "saving",
      "title": "Saving Hack",
      "desc": "Specific to their data"
    }
    ...3 total saving
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

export const balance = 5900

export const unavoidableExpenses = [
  { id: 1, title: "Rent", amount: 6500, tag: "ESSENTIAL", sub: "AUTO-PAY", icon: "home" },
  { id: 2, title: "Mess Fees", amount: 4800, tag: "UTILITY", sub: "PENDING", icon: "zap" },
  { id: 3, title: "Public Transport", amount: 800, tag: "LOGISTICS", sub: "SUBSCRIPTION", icon: "bus" }
]

export const avoidableExpenses = [
  { id: 4, title: "Late Night Pizza", amount: 2500, mood: "REGRET", tag: "WEEKEND", icon: "utensils" },
  { id: 5, title: "Movie Tickets", amount: 1500, mood: "HAPPY", tag: "ENTERTAINMENT", icon: "film" },
  { id: 6, title: "Tech Accessories", amount: 3000, mood: "NEUTRAL", tag: "", icon: "briefcase" }
]

export const savingsData = [
  { month: "OCT", amount: 1200 },
  { month: "NOV", amount: 2500 },
  { month: "DEC", amount: 3800 },
  { month: "JAN", amount: 4200 },
  { month: "FEB", amount: 5100 },
  { month: "MAR", amount: 5900 }
]

export const categoryData = [
  { name: "Lifestyle", value: 7000 },
  { name: "Investment", value: 5900 },
  { name: "Utilities", value: 4800 },
  { name: "Transit", value: 800 },
  { name: "Academics", value: 3000 },
  { name: "Rent", value: 6500 }
]

export const streakData = {
  currentStreak: 18,
  longestStreak: 24,
  globalRank: 142,
  nextMilestone: 30,
  milestoneProgress: 60
}

export const milestones = [
  { title: "IGNITION", sub: "7 DAY STREAK", unlocked: true },
  { title: "ARCHITECT", sub: "30 DAY STREAK", unlocked: true },
  { title: "CENTURY", sub: "100 DAY STREAK", unlocked: false },
  { title: "ORACLE", sub: "JOURNAL KING", unlocked: false },
  { title: "BULL RUN", sub: "INVESTMENT STREAK", unlocked: false },
  { title: "TITAN", sub: "1 YEAR MASTERY", unlocked: false }
]

export const habits = [
  { title: "Expense Review", desc: "Daily audit of digital transactions completed.", status: "SUCCESS", days: ["M","T","W","T","F"] },
  { title: "Market Journaling", desc: "Summarized 3 market movers of the day.", status: "SUCCESS", days: ["M","T","W","T","F"] },
  { title: "Micro-Investing", desc: "Invested spare change into SYMP's Fund.", status: "SUCCESS", days: ["M","T","W","T","F"] }
]

export const simulatorDefaults = {
  income: 25000,
  unavoidable: 12100,
  avoidable: 7000
}

export const aiSuggestions = [
  { title: "Switch to Cycle", desc: "Save ₹800/month on public transport by using the campus cycle pool." },
  { title: "Shared Subscriptions", desc: "Share your Netflix/Spotify with 3 friends to save ₹400/month." },
  { title: "Library over Buying", desc: "Borrow reference books from the library instead of buying new ones to save ₹600." }
]

export const goals = [
  { id: 1, title: "Emergency Fund", target: 50000, current: 32000, deadline: "Dec 2025", icon: "shield" },
  { id: 2, title: "New Laptop", target: 80000, current: 45000, deadline: "Mar 2026", icon: "laptop" },
  { id: 3, title: "Trip to Goa", target: 25000, current: 18000, deadline: "Jan 2026", icon: "plane" }
]

export const investments = [
  { id: 1, title: "Nifty 50 Index SIP", type: "Mutual Fund", amount: 2000, returns: "+12.4%", status: "ACTIVE", icon: "trending-up" },
  { id: 2, title: "Gold ETF", type: "ETF", amount: 1500, returns: "+8.2%", status: "ACTIVE", icon: "coins" },
  { id: 3, title: "Emergency Liquid Fund", type: "Liquid Fund", amount: 5000, returns: "+6.1%", status: "ACTIVE", icon: "piggy-bank" },
  { id: 4, title: "Tech Stocks", type: "Stocks", amount: 3000, returns: "-2.3%", status: "REVIEW", icon: "bar-chart" }
]

export const journalEntries = [
  { id: 1, date: "Mar 28", mood: "HAPPY", title: "Avoided impulse buy", body: "Was about to buy new headphones for ₹4,500 but decided to wait. Feeling good about this decision.", tag: "WIN", amount: 4500 },
  { id: 2, date: "Mar 26", mood: "REGRET", title: "Overspent on dining", body: "Went out with friends and spent ₹2,200. Should have suggested a cheaper place.", tag: "LOSS", amount: 2200 },
  { id: 3, date: "Mar 24", mood: "NEUTRAL", title: "Paid rent on time", body: "Set up auto pay for rent. One less thing to worry about.", tag: "ESSENTIAL", amount: 8500 }
]

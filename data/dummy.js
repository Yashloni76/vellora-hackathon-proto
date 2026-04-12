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

export const habits = [
  { title: "Expense Review", desc: "Daily audit of digital transactions completed.", status: "SUCCESS", days: ["M","T","W","T","F"] }
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

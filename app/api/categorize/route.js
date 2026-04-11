import { callAI } from '@/lib/claude'

export async function POST(req) {
  const { expenses, userContext } = await req.json()

  if (!expenses || expenses.length === 0) {
    return Response.json([])
  }

  const prompt = `You are a personal finance
categorizer for young Indian users (students and
working professionals aged 18-25).

USER CONTEXT:
${userContext || 'Young Indian student or working professional'}

UNAVOIDABLE EXPENSES (essential for survival and daily life):

HOUSING:
- Rent, house EMI, property tax
- Society maintenance charges
- Electricity bill, water bill
- Cooking gas (LPG, pipeline gas)
- Basic home repairs (leak, wiring)

FOOD (basic nutrition only):
- Basic groceries (rice, wheat, dal, vegetables, oil)
- Milk, eggs, basic protein sources
- Drinking water if purchased
- Essential cooking items (salt, spices, masalas)
- Canteen food, mess fees, tiffin service
  (if it is their PRIMARY daily meal source)
- Dabba service, hostel mess

HEALTH:
- Doctor consultations
- Medicines, pharmacy
- Health insurance premium
- Emergency treatments
- Basic health checkups
- Gym membership (if used regularly for health)

TRANSPORT (daily commute only):
- Daily bus/metro/train pass for college or work
- Minimum required fuel for daily commute
- Auto/rickshaw for regular daily route
- Basic vehicle maintenance (oil change, tyre)

COMMUNICATION:
- Basic mobile recharge (calls and data)
- Internet/WiFi if needed for study or work
- Essential communication costs

EDUCATION:
- Tuition fees, course fees
- Books and study material
- Exam fees
- Basic devices (laptop/phone for study/work)
- Stationery, notebooks

FINANCIAL COMMITMENTS:
- EMI payments (loan, credit card minimum)
- Insurance premiums (life, health, vehicle)
- SIP/investments already committed
- Bank charges

AVOIDABLE EXPENSES (lifestyle choices that can be reduced):

FOOD AND DINING:
- Restaurant dining (occasional)
- Zomato, Swiggy, food delivery apps
- Cafes, Starbucks, coffee shops
- Fast food chains (McDonald's, KFC, Dominos)
- Alcohol, cold drinks, packaged snacks
- Party food, celebration meals
- Junk food, chips, chocolates

ENTERTAINMENT:
- Movies, concerts, events, shows
- OTT subscriptions (Netflix, Prime, Hotstar)
- Gaming, in-app purchases, game credits
- Amusement parks, adventure activities
- Streaming music premium plans

SHOPPING:
- Clothes beyond necessity
- Amazon, Flipkart online shopping
- Accessories, jewellery, watches
- Home decor items
- Gadgets beyond necessity (extra headphones etc)

PERSONAL CARE (beyond basic):
- Salon, spa, parlour visits
- Premium skincare, makeup
- Perfumes, grooming extras

TRAVEL (beyond daily commute):
- Trips, vacations, weekend getaways
- Ola/Uber for non-essential rides
- Luxury transport upgrades

SUBSCRIPTIONS:
- Premium app subscriptions
- Magazine, newsletter subscriptions
- Any recurring non-essential subscription

CONTEXT RULES:
1. If expense title suggests DAILY/REGULAR necessity
   for their life = unavoidable
2. If expense title suggests OCCASIONAL/LUXURY
   choice = avoidable
3. When in doubt about food: if it is their primary
   meal source = unavoidable, if it is extra/treat = avoidable
4. Transport: daily commute = unavoidable,
   leisure travel = avoidable

Expenses to categorize:
${expenses.map((e, i) =>
  `${i + 1}. "${e.title}": Rs ${e.amount} 
  (selected category: ${e.category || 'general'})`
).join('\n')}

Return ONLY a JSON array, absolutely no extra text,
no markdown, no explanation outside the array:
[{"title":"exact expense title","amount":exact_amount,"category":"avoidable or unavoidable","semanticCategory":"categorize into exactly one of: food, travel, shopping, entertainment, health, rent, utilities, education, other","reason":"one line reason specific to why"}]`

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
      'rent', 'emi', 'electricity', 'electric', 'bill',
      'water', 'gas', 'lpg', 'cylinder', 'repair',
      'rice', 'wheat', 'dal', 'vegetables', 'sabzi',
      'grocery', 'groceries', 'milk', 'eggs', 'oil',
      'medicine', 'medical', 'doctor', 'hospital',
      'pharmacy', 'health', 'insurance', 'checkup',
      'bus', 'metro', 'train', 'transport', 'commute',
      'petrol', 'diesel', 'fuel', 'vehicle maintenance',
      'mobile', 'recharge', 'internet', 'wifi', 'broadband',
      'tuition', 'fees', 'college', 'school', 'exam',
      'books', 'stationery', 'notebook', 'laptop',
      'canteen', 'mess', 'tiffin', 'dabba', 'hostel',
      'maintenance', 'society', 'property tax',
      'loan', 'emi', 'sip', 'investment committed'
    ]

    const avoidableKeywords = [
      'zomato', 'swiggy', 'restaurant', 'cafe',
      'starbucks', 'mcdonalds', 'kfc', 'dominos',
      'pizza', 'burger', 'alcohol', 'beer', 'wine',
      'netflix', 'prime', 'hotstar', 'spotify',
      'movie', 'cinema', 'concert', 'event',
      'amazon', 'flipkart', 'shopping', 'clothes',
      'salon', 'spa', 'parlour', 'makeup', 'skincare',
      'gaming', 'game', 'uber', 'ola', 'rapido',
      'trip', 'vacation', 'travel', 'hotel',
      'party', 'celebration', 'outing', 'hangout',
      'accessories', 'gadget', 'headphone', 'watch'
    ]

    const semanticCategoryMap = {
      food: ['zomato', 'swiggy', 'restaurant', 'cafe', 'starbucks', 'mcdonalds', 'kfc', 'dominos', 'pizza', 'burger', 'rice', 'wheat', 'dal', 'vegetables', 'sabzi', 'grocery', 'groceries', 'milk', 'eggs', 'oil', 'canteen', 'mess', 'tiffin', 'dabba', 'hostel', 'alcohol', 'beer', 'wine'],
      travel: ['bus', 'metro', 'train', 'transport', 'commute', 'petrol', 'diesel', 'fuel', 'vehicle', 'uber', 'ola', 'rapido', 'trip', 'vacation', 'travel', 'hotel'],
      shopping: ['amazon', 'flipkart', 'shopping', 'clothes', 'accessories', 'gadget', 'watch'],
      entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'movie', 'cinema', 'concert', 'event', 'gaming', 'game', 'party', 'celebration', 'outing', 'hangout'],
      health: ['medicine', 'medical', 'doctor', 'hospital', 'pharmacy', 'health', 'insurance', 'checkup', 'salon', 'spa', 'parlour', 'skincare'],
      rent: ['rent', 'emi', 'society', 'property', 'maintenance', 'loan'],
      utilities: ['electricity', 'electric', 'bill', 'water', 'gas', 'lpg', 'cylinder', 'repair', 'mobile', 'recharge', 'internet', 'wifi', 'broadband'],
      education: ['tuition', 'fees', 'college', 'school', 'exam', 'books', 'stationery', 'notebook', 'laptop']
    };

    const fallback = expenses.map(e => {
      const titleLower = e.title.toLowerCase()

      const isAvoidable = avoidableKeywords
        .some(k => titleLower.includes(k))
      const isUnavoidable = unavoidableKeywords
        .some(k => titleLower.includes(k))

      let category = 'avoidable'
      let reason = 'Lifestyle expense that can be reduced'

      if (isUnavoidable && !isAvoidable) {
        category = 'unavoidable'
        reason = 'Essential expense required for daily life'
      } else if (isAvoidable) {
        category = 'avoidable'
        reason = 'Lifestyle choice that can be reduced or skipped'
      } else {
        category = 'avoidable'
        reason = 'Could not determine, marked as avoidable by default'
      }

      let semanticCategory = 'other';
      for (const [cat, words] of Object.entries(semanticCategoryMap)) {
        if (words.some(w => titleLower.includes(w))) {
          semanticCategory = cat;
          break;
        }
      }

      return {
        title: e.title,
        amount: e.amount,
        category,
        semanticCategory,
        reason
      }
    })

    return Response.json(fallback)
  }
}

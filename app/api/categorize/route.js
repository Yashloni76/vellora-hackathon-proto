const UNAVOIDABLE_KEYWORDS = ["rent", "bill", "transport", "electricity", "water", "insurance", "emi"];

const KEYWORD_REASONS = {
  rent: "Housing is a fixed essential expense.",
  bill: "Utility bills are recurring necessities.",
  transport: "Commuting is essential for daily livelihood.",
  electricity: "Electricity is a basic utility and unavoidable.",
  water: "Water is a basic necessity and unavoidable.",
  insurance: "Insurance premiums are essential for financial protection.",
  emi: "EMI payments are fixed financial obligations."
};

export async function POST(request) {
  const { expenses } = await request.json();

  const result = expenses.map(({ title, amount }) => {
    const lower = title.toLowerCase();
    const matchedKeyword = UNAVOIDABLE_KEYWORDS.find((kw) => lower.includes(kw));

    if (matchedKeyword) {
      return {
        title,
        amount,
        category: "unavoidable",
        reason: KEYWORD_REASONS[matchedKeyword]
      };
    }

    return {
      title,
      amount,
      category: "avoidable",
      reason: "This expense is discretionary and can be reduced or eliminated."
    };
  });

  return Response.json(result);
}

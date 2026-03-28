export async function POST() {
  const suggestions = [
    { type: "investment", title: "Start a SIP", desc: "Redirect ₹2,000 from dining expenses into a monthly index fund SIP." },
    { type: "investment", title: "Emergency Fund", desc: "Move ₹1,000/month into a liquid mutual fund for emergencies." },
    { type: "investment", title: "Gold ETF", desc: "Allocate 5% of savings into Gold ETF for portfolio diversification." },
    { type: "saving", title: "Cancel OTT", desc: "You have 3 active subscriptions. Consolidate to 1 and save ₹800/month." },
    { type: "saving", title: "Meal Prep", desc: "Replace ₹4,200 dining spend with home cooking, save ₹2,500/month." },
    { type: "saving", title: "Weekend Budget", desc: "Set a ₹500/day UPI limit on weekends to control lifestyle spending." }
  ];

  return Response.json({ suggestions });
}

export async function callAI(prompt) {
  try {
    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        })
      }
    )

    if (!res.ok) {
      const errData = await res.json()
      throw new Error('Groq error: ' + errData.error?.message)
    }

    const data = await res.json()

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content
    }

    throw new Error('Empty response from Groq')

  } catch (error) {
    console.error('Groq failed:', error.message)
    throw new Error('AI_FAILED: ' + error.message)
  }
}

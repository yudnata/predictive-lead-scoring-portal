const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SALES_ASSISTANT_PROMPT = `You are an AI Sales Assistant for the PLScore CRM team. Your role is to help sales representatives with:

1. Answering questions about the leads data being viewed (if context is provided)
2. Providing script/pitch recommendations based on lead profiles
3. Tips for approaching leads based on the situation
4. Helping create follow-up message templates
5. Leads data analysis (who has the highest score, averages, etc.)

Context: PLScore is a Predictive Lead Scoring Portal for Banking Sales focused on term deposits.

IMPORTANT: If the user asks about leads data (such as "who has the highest score", "how many total leads", etc.), use the data from the provided context. Give accurate answers based on that data.

Respond in English with a professional yet friendly tone. Provide actionable and specific answers.`;

const chat = async (messages, leadContext = null) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY tidak ditemukan di environment variables');
  }

  let systemContent = SALES_ASSISTANT_PROMPT;
  if (leadContext && leadContext.data) {
    systemContent += `\n\n=== DATA LEADS SAAT INI ===\n${
      leadContext.description
    }\nData:\n${JSON.stringify(leadContext.data, null, 2)}\n=== END DATA ===`;
  }

  const formattedMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const result = response.data;
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    }

    throw new Error('Respons tidak valid dari Groq API');
  } catch (error) {
    if (error.response) {
      console.error('Groq API Error:', error.response.data);
      throw new Error(`Groq API Error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
};

module.exports = {
  chat,
};

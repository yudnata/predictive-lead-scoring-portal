const aiService = require('../services/ai.service');

const chat = async (req, res) => {
  try {
    const { messages, leadContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required and cannot be empty',
      });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          success: false,
          message: 'Each message must have role and content',
        });
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({
          success: false,
          message: 'Message role must be "user" or "assistant"',
        });
      }
    }

    const response = await aiService.chat(messages, leadContext);

    res.json({
      success: true,
      data: {
        message: response,
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat request',
    });
  }
};

module.exports = {
  chat,
};

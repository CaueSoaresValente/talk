// AI Service - Simulated intelligent agent for English teaching
// Can be replaced with OpenAI/Gemini API integration

const LEVEL_PROMPTS = {
  beginner: 'You are a friendly English teacher for beginners. Use simple vocabulary, short sentences, and basic grammar. Be encouraging and patient. Always correct mistakes gently.',
  basic: 'You are an English teacher for basic level students. Use everyday vocabulary and common expressions. Introduce simple grammar patterns. Be supportive.',
  intermediate: 'You are an English teacher for intermediate students. Use varied vocabulary and more complex sentence structures. Challenge them with idioms and phrasal verbs.',
  advanced: 'You are an English teacher for advanced students. Use sophisticated vocabulary, complex grammar, and discuss abstract topics. Push them to express nuanced ideas.',
  fluent: 'You are an English conversation partner for fluent speakers. Engage in natural, complex discussions. Use slang, humor, and cultural references.'
};

const CONVERSATION_STARTERS = {
  beginner: [
    "Hello! 👋 I'm your English teacher. Let's start with something simple. What's your name?",
    "Hi there! Welcome to our English class. How are you feeling today?",
    "Hello! Let's practice English together. Can you tell me about your day?"
  ],
  basic: [
    "Hey! Great to see you. Let's have a conversation. What did you do last weekend?",
    "Hi! Today let's practice talking about hobbies. What do you like to do in your free time?",
    "Hello! Let's chat. Have you watched any good movies recently?"
  ],
  intermediate: [
    "Welcome back! I'd love to hear your thoughts on something. If you could travel anywhere in the world, where would you go and why?",
    "Hi! Let's discuss an interesting topic today. What do you think about the impact of technology on our daily lives?",
    "Hello! Let's have a meaningful conversation. What's something you've learned recently that surprised you?"
  ],
  advanced: [
    "Greetings! Let's delve into a thought-provoking topic. How do you think artificial intelligence will reshape education in the next decade?",
    "Welcome! I'd like to discuss the nuances of cultural identity. How has globalization influenced the way people define themselves?",
    "Hello! Let's explore a complex issue. What are the ethical implications of social media's influence on public opinion?"
  ],
  fluent: [
    "Hey there! Let's have a stimulating discussion. I've been pondering the philosophical question of whether free will truly exists — what's your take on it?",
    "Welcome! Let's tackle something intellectually challenging. How would you reconcile the tension between individual freedom and collective responsibility in modern democracies?",
    "Hi! Let's dive deep. In what ways do you think the concept of 'truth' has evolved in the age of misinformation?"
  ]
};

const RESPONSES = {
  beginner: [
    "That's great! 😊 Your English is improving. Let me help you with one thing: {correction}. Can you try again?",
    "Very good! I understood what you said. A small tip: {correction}. Keep going, you're doing well!",
    "Nice try! 👍 Here's a little correction: {correction}. Don't worry, practice makes perfect!",
    "Good job! Let me show you a better way to say that: {correction}. What else would you like to talk about?",
    "I like your effort! Just remember: {correction}. You're making great progress!"
  ],
  basic: [
    "Good point! Just a small correction: {correction}. Can you tell me more about that?",
    "Interesting! By the way, {correction}. What do you think about this topic?",
    "I see what you mean. A quick note: {correction}. Let's continue our conversation!",
    "That's a nice thought! Here's a tip: {correction}. Would you like to practice more?"
  ],
  intermediate: [
    "That's a thoughtful observation. I'd suggest rephrasing it as: {correction}. What's your perspective on this?",
    "Interesting perspective! A small refinement: {correction}. Can you elaborate on that idea?",
    "I appreciate your point. Consider this alternative: {correction}. How would you counter-argue?",
    "Well expressed! Just one thing: {correction}. Let's dive deeper into this topic."
  ],
  advanced: [
    "A sophisticated argument. However, consider the nuance: {correction}. How does this affect your thesis?",
    "Eloquently put. One subtle correction: {correction}. Can you explore the implications further?",
    "Your analysis is compelling. A minor refinement: {correction}. What counterarguments might you anticipate?",
    "Thought-provoking indeed. I'd adjust this slightly: {correction}. How does this intersect with broader trends?"
  ],
  fluent: [
    "Brilliantly articulated. Just a stylistic suggestion: {correction}. Your command of English is impressive.",
    "A nuanced perspective. Even at this level, consider: {correction}. What are the ramifications?",
    "Masterfully expressed. A subtle point: {correction}. Let's push this discussion even further."
  ]
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateConversationStart(level) {
  const starters = CONVERSATION_STARTERS[level] || CONVERSATION_STARTERS.beginner;
  return getRandomItem(starters);
}

function generateResponse(userMessage, level, conversationHistory = []) {
  const responses = RESPONSES[level] || RESPONSES.beginner;
  const template = getRandomItem(responses);

  // Simple grammar analysis for the correction placeholder
  const corrections = analyzeGrammar(userMessage);
  const correctionText = corrections.length > 0
    ? corrections[0].suggestion
    : "everything looks correct! Keep up the good work";

  let response = template.replace('{correction}', correctionText);

  // Add contextual follow-up based on message content
  const followUps = generateContextualFollowUp(userMessage, level);
  if (followUps) {
    response += ' ' + followUps;
  }

  return response;
}

function analyzeGrammar(text) {
  const errors = [];

  // Common grammar patterns to detect
  const patterns = [
    { regex: /\bi\b(?!\s*')/gi, type: 'grammar', message: '"i" should be capitalized to "I"', suggestion: 'Remember to always capitalize "I" when referring to yourself' },
    { regex: /\bdont\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "don\'t" instead of "dont"' },
    { regex: /\bwont\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "won\'t" instead of "wont"' },
    { regex: /\bcant\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "can\'t" instead of "cant"' },
    { regex: /\bim\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "I\'m" instead of "im"' },
    { regex: /\bdidnt\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "didn\'t" instead of "didnt"' },
    { regex: /\bisnt\b/gi, type: 'grammar', message: 'Missing apostrophe', suggestion: 'Use "isn\'t" instead of "isnt"' },
    { regex: /\bhe go\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "he goes" instead of "he go" — third person singular needs -s/-es' },
    { regex: /\bshe go\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "she goes" instead of "she go"' },
    { regex: /\bhe have\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "he has" instead of "he have"' },
    { regex: /\bshe have\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "she has" instead of "she have"' },
    { regex: /\bmore better\b/gi, type: 'grammar', message: 'Double comparative', suggestion: 'Use just "better" instead of "more better"' },
    { regex: /\bmost best\b/gi, type: 'grammar', message: 'Double superlative', suggestion: 'Use just "best" instead of "most best"' },
    { regex: /\byesterday .+?(go|eat|see|do|make|take|come|give|know|think)\b/gi, type: 'grammar', message: 'Past tense needed', suggestion: 'When talking about yesterday, use the past tense form of the verb' },
    { regex: /\bi is\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "I am" instead of "I is"' },
    { regex: /\bthey is\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "they are" instead of "they is"' },
    { regex: /\bwe is\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "we are" instead of "we is"' },
    { regex: /\byou is\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'Use "you are" instead of "you is"' },
    { regex: /\bgoed\b/gi, type: 'vocabulary', message: 'Irregular past tense', suggestion: 'The past tense of "go" is "went", not "goed"' },
    { regex: /\beated\b/gi, type: 'vocabulary', message: 'Irregular past tense', suggestion: 'The past tense of "eat" is "ate", not "eated"' },
    { regex: /\brunned\b/gi, type: 'vocabulary', message: 'Irregular past tense', suggestion: 'The past tense of "run" is "ran", not "runned"' },
    { regex: /\bthinked\b/gi, type: 'vocabulary', message: 'Irregular past tense', suggestion: 'The past tense of "think" is "thought", not "thinked"' },
    { regex: /[^.!?]\s*$/g, type: 'punctuation', message: 'Missing punctuation', suggestion: 'Remember to end your sentences with proper punctuation (. ! ?)' },
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        const index = text.indexOf(match);
        errors.push({
          type: pattern.type,
          word: match,
          startIndex: index,
          endIndex: index + match.length,
          message: pattern.message,
          suggestion: pattern.suggestion
        });
      });
    }
  });

  return errors;
}

function generateContextualFollowUp(message, level) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('hobby') || lowerMsg.includes('like to')) {
    return "That sounds like a fun hobby! How often do you practice it?";
  }
  if (lowerMsg.includes('work') || lowerMsg.includes('job')) {
    return "That's interesting! What do you enjoy most about your work?";
  }
  if (lowerMsg.includes('travel') || lowerMsg.includes('trip')) {
    return "Traveling is wonderful! What was the most memorable place you've visited?";
  }
  if (lowerMsg.includes('food') || lowerMsg.includes('cook') || lowerMsg.includes('eat')) {
    return "Yum! What's your favorite dish to cook or eat?";
  }
  if (lowerMsg.includes('movie') || lowerMsg.includes('film') || lowerMsg.includes('watch')) {
    return "What genre do you enjoy the most?";
  }
  if (lowerMsg.includes('music') || lowerMsg.includes('song') || lowerMsg.includes('sing')) {
    return "Music is a great way to learn English! Do you have a favorite English song?";
  }
  if (lowerMsg.includes('study') || lowerMsg.includes('learn') || lowerMsg.includes('school')) {
    return "That's a great attitude! What motivates you to keep learning?";
  }

  return null;
}

module.exports = {
  generateConversationStart,
  generateResponse,
  analyzeGrammar
};

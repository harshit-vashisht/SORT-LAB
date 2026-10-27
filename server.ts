import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize DeepSeek client if DEEPSEEK_API_KEY is configured
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
let deepseekClient: OpenAI | null = null;

if (deepseekApiKey) {
  deepseekClient = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: deepseekApiKey,
    maxRetries: 1,
    timeout: 10000,
  });
}

// Initialize OpenAI client if OPENAI_API_KEY is configured
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
let openaiClient: OpenAI | null = null;

if (openaiApiKey) {
  openaiClient = new OpenAI({
    apiKey: openaiApiKey,
    maxRetries: 0,
    timeout: 3500,
  });
}

// Initialize Gemini client as auxiliary fallback if GEMINI_API_KEY is configured
const geminiApiKey = process.env.GEMINI_API_KEY;
let geminiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  geminiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 4500,
    },
  });
}

// Fallback intelligent Socratic tutor logic when API key is unavailable or during network outage
function generateFallbackMentorReply(message: string, context?: any, locale: string = 'en'): string {
  const text = (message || '').toLowerCase();
  const arr = context?.array ? `[${context.array.join(', ')}]` : '';
  const currentPair =
    context?.indices?.length === 2 && context?.array
      ? `comparing values ${context.array[context.indices[0]]} (index ${context.indices[0]}) and ${
          context.array[context.indices[1]]
        } (index ${context.indices[1]})`
      : '';

  // Hindi responses
  if (locale === 'hi') {
    if (text.includes('hint') || text.includes('मदद') || text.includes('help')) {
      return `बबल सॉर्ट (Bubble Sort) का मुख्य नियम यह है: पास (pass) के दौरान हम हमेशा दो पास-पास (adjacent) वाले तत्वों की तुलना करते हैं। अगर बायाँ तत्व दाएँ से बड़ा है, तो हम उन्हें स्वैप (swap) करते हैं ताकि बड़ा नंबर दाईं ओर खिसक सके!`;
    }
    if (text.includes('analogy') || text.includes('उदाहरण') || text.includes('different way')) {
      return `एक सरल उदाहरण सोचिए: जैसे कुछ दोस्त अपनी ऊंचाई के क्रम में लाइन में खड़े हो रहे हैं। दो दोस्त जो साथ खड़े हैं, अपनी ऊंचाई नापते हैं—अगर आगे वाला लंबा है, तो वे अपनी जगह बदल लेते हैं!`;
    }
    return `नमस्ते! मैं आपका SORT//LAB AI मेंटर हूँ। वर्तमान में एरे ${arr || 'उपलब्ध'} है। आप किस चरण या तुलना के बारे में पूछना चाहते हैं?`;
  }

  // Punjabi responses
  if (locale === 'pa') {
    if (text.includes('hint') || text.includes('ਮਦਦ') || text.includes('help')) {
      return `ਬਬਲ ਸੌਰਟ (Bubble Sort) ਦਾ ਸਰਲ ਨਿਯਮ: ਹਰ ਗੇੜ ਵਿੱਚ ਅਸੀਂ ਨਾਲ ਲੱਗਦੇ ਦੋ ਤੱਤਾਂ ਦੀ ਤੁਲਨਾ ਕਰਦੇ ਹਾਂ। ਜੇਕਰ ਖੱਬਾ ਤੱਤ ਵੱਡਾ ਹੈ, ਤਾਂ ਉਹਨਾਂ ਦੀ ਜਗ੍ਹਾ ਬਦਲੀ (swap) ਕੀਤੀ ਜਾਂਦੀ ਹੈ!`;
    }
    return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ SORT//LAB AI ਮੈਂਟਰ ਹਾਂ। ਐਲਗੋਰਿਦਮ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ।`;
  }

  // English Socratic logic
  if (text.includes('explain') || text.includes('why') || text.includes('comparison')) {
    if (context?.indices?.length === 2 && context?.array) {
      const a = context.array[context.indices[0]];
      const b = context.array[context.indices[1]];
      if (a > b) {
        return `We are currently comparing ${a} (index ${context.indices[0]}) and ${b} (index ${context.indices[1]}). Because ${a} > ${b}, they are out of relative order! In Bubble Sort, larger values must bubble rightward, so a swap is executed: swap(${a}, ${b}). What do you expect will happen in the next adjacent step?`;
      } else if (a === b) {
        return `We are comparing ${a} and ${b}. Because they are equal (${a} == ${b}), no swap is needed. Bubble Sort preserves the relative order of duplicate elements, making it a stable sort.`;
      } else {
        return `We are comparing ${a} and ${b}. Since ${a} <= ${b}, they are already in correct relative order for this pair. No swap is performed, and our comparison window advances to the next adjacent pair.`;
      }
    }
    return `In Bubble Sort, we repeatedly step through the list, compare adjacent elements, and swap them if they are in the wrong order. With each full pass, the highest unsorted value is guaranteed to 'bubble up' to its final position at the end.`;
  }

  if (text.includes('different way') || text.includes('analogy') || text.includes('simpler')) {
    return `Here is a physical analogy:\nImagine holding a hand of numbered playing cards or arranging heavy and light blocks. If you hold two adjacent cards and the left one is heavier/larger than the right one, you swap them. Repeating this across the whole row causes the heaviest card to drift naturally to the far right end, like a bubble rising to the top of water!`;
  }

  if (text.includes('level 1') || text.includes('socratic question') || text.includes('guiding question')) {
    return `Level 1 Guiding Question:\nTake a look at the two highlighted elements right now. If our goal is ascending order (smallest on the left, largest on the right), does the left element belong before or after the right element? What does this tell you about whether a swap must happen?`;
  }

  if (text.includes('level 2') || text.includes('invariant concept') || text.includes('underlying concept')) {
    return `Level 2 Invariant Concept:\nKey Invariant: After pass 'i', the last 'i' elements are in their final, permanently sorted positions. That means on pass 1, the single largest item locks into the last slot. On pass 2, the second-largest locks into the second-to-last slot!`;
  }

  if (text.includes('level 3') || text.includes('bug focus') || text.includes('location focus')) {
    return `Level 3 Location Focus:\nCheck your loop termination condition: since pass 'i' guarantees the rightmost elements are already locked, the inner comparison loop only needs to run up to index (n - 1 - i). Running beyond that checks elements that cannot change order!`;
  }

  if (text.includes('complexity') || text.includes('big o') || text.includes('time')) {
    return `Bubble Sort Time Complexity:\n• Worst case: O(n²) when the array is in reverse order.\n• Average case: O(n²) comparisons and swaps.\n• Best case: O(n) when the array is already sorted (if you maintain an early-exit 'swapped' flag!).\n• Space complexity: O(1) auxiliary space (in-place).`;
  }

  if (text.includes('what is an array') || text.includes('beginner') || text.includes('zero')) {
    return `Welcome! An array is simply an ordered row of numbered boxes (or slots). Each box holds a piece of data (like a number), and each slot has an address called an 'index' that starts at 0. Sorting simply means rearranging the numbers so they increase from left to right!`;
  }

  if (text.includes('hint') || text.includes('help') || text.includes('stuck')) {
    if (context?.mode === 'arena') {
      return `Look closely at your inner loop boundary. In pass 'i', the last 'i' elements are already sorted. Your inner loop only needs to run while 'j < n - 1 - i'. Also check that your swap condition is strictly greater (arr[j] > arr[j + 1]).`;
    }
    if (context?.mode === 'play') {
      return `Compare the two highlighted blocks: if the left block is taller (larger number) than the right block, they must swap so the bigger number moves right. Otherwise, keep them as they are!`;
    }
    return `Observe the rightmost end of the array after each pass. Notice how each pass locks in one more element in green (sorted)? That reduces the work needed in subsequent passes!`;
  }

  return `I'm observing your laboratory session! Right now ${
    arr ? `the array is ${arr}` : 'we are examining sorting invariants'
  }. ${
    currentPair ? `Currently ${currentPair}.` : 'Feel free to step through the visualization, predict swaps, or ask me any question!'
  }`;
}

// AI Mentor API endpoint
app.post('/api/mentor', async (req: Request, res: Response) => {
  const { message, locale = 'en', sessionContext, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  let languageDirective = 'Respond in concise, encouraging English.';
  if (locale === 'hi') {
    languageDirective = 'Respond naturally in conversational Hindi (हिन्दी) using Devanagari script, keeping code syntax and technical terms in English.';
  } else if (locale === 'pa') {
    languageDirective = 'Respond naturally in conversational Punjabi (ਪੰਜਾਬੀ) using Gurmukhi script, keeping code syntax and technical terms in English.';
  }

  const systemPrompt = `You are the AI Mentor for SORT//LAB, a calm, editorial, gamified computer science and algorithm learning laboratory.
Your persona is warm, encouraging, pedagogically sharp, and deeply patient—like a master tutor at an elite CS laboratory who treats every student with curiosity and respect.

Primary Pedagogical Rule:
- ALWAYS teach absolute beginners first without assumed prior knowledge. Use intuitive real-world physical analogies (e.g., sorting playing cards in your hands, organizing numbered books on a shelf, arranging children by height in a line).
- Guide step-by-step using the Socratic method: give progressive hints and prompt them to observe patterns BEFORE giving away code or final answers.
- Keep responses concise, clear, and actionable (2-3 short paragraphs or clean bullet points).
- If appropriate, ask a single short, guiding follow-up question or micro-challenge at the end of your response to solidify their understanding.
- Never use the word "mastered" when describing student skill level (use "Demonstrated", "Developing", or "Needs more evidence" instead).

Language & Locale Guidance:
${languageDirective}

Student Session Context:
- Experience Level: ${sessionContext?.experience || 'beginner'} (adapt explanations to this level)
- Preferred Programming Language: ${sessionContext?.language || 'Python'}
- Active Workspace Mode: ${sessionContext?.mode || 'visual'} (Options: 'visual', 'play', 'arena', 'flowchart', 'map', 'start-zero')
- Current Array State: ${sessionContext?.array ? JSON.stringify(sessionContext.array) : 'none'}
- Active Comparison Indices: ${sessionContext?.indices ? JSON.stringify(sessionContext.indices) : 'none'}
- Current Pass: ${sessionContext?.pass ?? 'N/A'}, Comparison Number: ${sessionContext?.comparison ?? 'N/A'}
- Student XP: ${sessionContext?.xp ?? 0}, Streak: ${sessionContext?.streak ?? 0}
- Hints Requested: ${sessionContext?.hintsUsed ?? 0}
- Recent Mistakes: ${sessionContext?.mistakes ? JSON.stringify(sessionContext.mistakes) : 'none'}`;

  // 1. Try DeepSeek API if configured
  if (deepseekClient) {
    try {
      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      if (Array.isArray(history)) {
        for (const turn of history.slice(-8)) {
          if (turn.role && turn.text) {
            chatMessages.push({
              role: turn.role === 'mentor' ? 'assistant' : 'user',
              content: turn.text,
            });
          }
        }
      }

      chatMessages.push({
        role: 'user',
        content: message,
      });

      const completion = await deepseekClient.chat.completions.create({
        model: deepseekModel,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 750,
      });

      const reply = completion.choices[0]?.message?.content || generateFallbackMentorReply(message, sessionContext, locale);

      return res.json({
        reply,
        isFallback: false,
        model: deepseekModel,
        provider: 'deepseek',
      });
    } catch (deepseekError: any) {
      console.warn('[SORT//LAB] DeepSeek API encountered an error, falling back:', deepseekError?.message);
    }
  }

  // 2. Try OpenAI GPT if configured
  if (openaiClient) {
    try {
      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      if (Array.isArray(history)) {
        for (const turn of history.slice(-8)) {
          if (turn.role && turn.text) {
            chatMessages.push({
              role: turn.role === 'mentor' ? 'assistant' : 'user',
              content: turn.text,
            });
          }
        }
      }

      chatMessages.push({
        role: 'user',
        content: message,
      });

      const completion = await openaiClient.chat.completions.create({
        model: openaiModel,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 650,
      });

      const reply = completion.choices[0]?.message?.content || generateFallbackMentorReply(message, sessionContext, locale);

      return res.json({
        reply,
        isFallback: false,
        model: openaiModel,
        provider: 'openai',
      });
    } catch (openAiError: any) {
      console.warn('[SORT//LAB] OpenAI API encountered an error, evaluating backup fallback:', openAiError?.message);
      // Fall through to Gemini or local heuristics
    }
  }

  // 2. Try Gemini client as auxiliary backup if present
  if (geminiClient) {
    try {
      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const turn of history.slice(-6)) {
          if (turn.role && turn.text) {
            contents.push({
              role: turn.role === 'mentor' ? 'model' : 'user',
              parts: [{ text: turn.text }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      let response;
      try {
        response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
      } catch (primaryGeminiErr: any) {
        console.warn('[SORT//LAB] gemini-3.8-flash unavailable, attempting gemini-3.1-flash-lite:', primaryGeminiErr?.message);
        response = await geminiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
      }

      const reply = response.text || generateFallbackMentorReply(message, sessionContext, locale);
      return res.json({
        reply,
        isFallback: false,
        provider: 'gemini',
      });
    } catch (geminiError: any) {
      console.warn('[SORT//LAB] Gemini fallback error:', geminiError?.message);
    }
  }

  // 3. Resilient Built-in Socratic Algorithm Tutor
  const fallbackReply = generateFallbackMentorReply(message, sessionContext, locale);
  return res.json({
    reply: fallbackReply,
    isFallback: true,
    provider: 'local-heuristics',
    notice: openaiApiKey
      ? 'Dynamic AI model is temporarily responding via local laboratory heuristics.'
      : 'Using built-in algorithm tutor heuristics (configure OPENAI_API_KEY in environment for OpenAI GPT responses).',
  });
});

// Setup Vite in development or serve static assets in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SORT//LAB] Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();

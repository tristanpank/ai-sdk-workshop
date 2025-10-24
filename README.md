# AI SDK Workshop - Starter Code

This repository contains starter code for a workshop on the Vercel AI SDK. Students will learn how to implement streaming AI responses in a chatbot interface.

## 🎯 Workshop Goals

By the end of this workshop, you will:
- Understand how to set up the Vercel AI SDK
- Implement a streaming chat API endpoint
- Connect the frontend to handle streaming responses
- Build a functional AI chatbot

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd ai-sdk-workshop
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and add your OpenAI API key:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace `your_api_key_here` with your actual API key.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Workshop Tasks

### Task 1: Set Up the API Route

Navigate to `app/api/chat/route.ts` and implement the streaming endpoint:

1. Import the necessary functions:
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
```

2. Extract messages from the request:
```typescript
const { messages } = await req.json();
```

3. Create a streaming response:
```typescript
const result = streamText({
  model: openai('gpt-4o-mini'),
  messages,
});

return result.toDataStreamResponse();
```

### Task 2: Implement Frontend Streaming

Navigate to `components/ChatInterface.tsx` and implement the API call in the `handleSubmit` function.

1. Use the `useChat` hook from the AI SDK (recommended approach):

First, import the hook:
```typescript
import { useChat } from 'ai/react';
```

Then replace the state management and handleSubmit with:
```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
```

2. Alternative: Manual fetch implementation (for learning purposes):
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...messages, userMessage] }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

// Read and process the stream
```

### Task 3: Test Your Implementation

1. Start a conversation with the chatbot
2. Observe the streaming response
3. Try different prompts and questions

## 🔧 Project Structure

```
ai-sdk-workshop/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint (TO IMPLEMENT)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── ChatInterface.tsx         # Chat UI component (TO IMPLEMENT)
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 📖 Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎓 Learning Points

- **Streaming Responses**: Learn how to stream AI responses for better UX
- **API Routes**: Understand Next.js API routes and server-side processing
- **React Hooks**: Use custom hooks to manage chat state
- **Type Safety**: Work with TypeScript for better development experience

## 🐛 Troubleshooting

- **API Key Error**: Make sure your `.env.local` file exists and has the correct API key
- **Port Already in Use**: Change the port by running `npm run dev -- -p 3001`
- **Build Errors**: Try deleting `node_modules` and `.next`, then run `npm install` again

## 📝 License

This project is for educational purposes.


# AI SDK v5 Workshop - Key Concepts Guide

This README serves as a reference guide for the key concepts from the Vercel AI SDK v5 that we'll use in this workshop. Use this as your "slide deck" to understand the building blocks.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- An Anthropic API key (optional) ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone this repository and install dependencies:
```bash
git clone <your-repo-url>
cd ai-sdk-workshop
npm install
```

2. Create a `.env.local` file with your API keys:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys.

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 AI SDK v5 Core Concepts

### 1. Model Providers: `createOpenAI` and `createAnthropic`

The AI SDK supports multiple model providers through provider-specific packages. You can create custom provider instances or use the default ones.

#### Using Default OpenAI Provider

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const result = await streamText({
  model: openai('gpt-4o-mini'),
  messages,
});
```

#### Using Custom OpenAI Provider

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const customOpenAI = createOpenAI({
  apiKey: process.env.CUSTOM_OPENAI_KEY,
  baseURL: 'https://custom-endpoint.com/v1',
  // Other configuration options
});

const result = await streamText({
  model: customOpenAI('gpt-4o-mini'),
  messages,
});
```

#### Using Anthropic Provider

```typescript
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  messages,
});
```

**Key Points:**
- Default providers (`openai`, `anthropic`) use environment variables automatically
- `createOpenAI` and `createAnthropic` allow custom configuration
- All providers implement the same interface, making them interchangeable
- Model names are provider-specific (e.g., `'gpt-4o-mini'` for OpenAI, `'claude-3-5-sonnet-20241022'` for Anthropic)

---

### 2. Streaming Responses: `streamText`

`streamText` is the core function for generating streaming text responses from language models. It enables real-time, token-by-token streaming for better user experience.

#### Basic Usage

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

#### With Additional Options

```typescript
const result = streamText({
  model: openai('gpt-4o-mini'),
  messages,
  system: 'You are a helpful assistant specialized in TypeScript.',
  temperature: 0.7,
  maxTokens: 500,
});
```

#### Return Format: `toDataStreamResponse()`

The `toDataStreamResponse()` method converts the stream into a Response object that:
- Uses the AI SDK's data stream protocol
- Automatically handles errors and metadata
- Works seamlessly with AI SDK React hooks
- Supports both text and tool call streaming

**Key Points:**
- `streamText` returns a result object, not directly a Response
- Call `toDataStreamResponse()` to get a Response compatible with Next.js API routes
- The stream format is optimized for the AI SDK's client-side hooks
- Streaming provides better UX by showing responses as they're generated

---

### 3. Tool Calling

Tools allow AI models to perform actions or retrieve information during a conversation. The AI SDK v5 has a powerful tool calling system.

#### Defining Tools

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: openai('gpt-4o-mini'),
  messages,
  tools: {
    weather: tool({
      description: 'Get the current weather in a location',
      parameters: z.object({
        location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      }),
      execute: async ({ location }) => {
        // Call your weather API here
        const temperature = 72; // Mock data
        return { location, temperature, unit: 'F' };
      },
    }),
    calculator: tool({
      description: 'Perform basic arithmetic operations',
      parameters: z.object({
        operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
        a: z.number(),
        b: z.number(),
      }),
      execute: async ({ operation, a, b }) => {
        switch (operation) {
          case 'add': return a + b;
          case 'subtract': return a - b;
          case 'multiply': return a * b;
          case 'divide': return a / b;
        }
      },
    }),
  },
});
```

#### Tool Execution Flow

1. User sends a message
2. AI decides if it needs to use a tool
3. AI generates a tool call with parameters
4. Tool's `execute` function runs automatically
5. Result is sent back to the AI
6. AI continues the conversation with the tool result

**Key Points:**
- Tools use Zod schemas for parameter validation
- The `execute` function is called automatically by the SDK
- Multiple tools can be defined in a single request
- Tools enable AI to perform actions beyond text generation
- Tool results are automatically included in the conversation context

---

### 4. Message Parts Standard

In AI SDK v5, messages have a `parts` structure that represents different types of content within a message. This is especially important when rendering tool calls in the UI.

#### Message Structure

```typescript
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<TextPart | ToolCallPart | ToolResultPart>;
};

type TextPart = {
  type: 'text';
  text: string;
};

type ToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: any;
};

type ToolResultPart = {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: any;
};
```

#### Rendering Message Parts

```typescript
{messages.map((message) => (
  <div key={message.id}>
    {message.parts?.map((part, idx) => {
      switch (part.type) {
        case 'text':
          return <p key={idx}>{part.text}</p>;
        
        case 'tool-call':
          return (
            <div key={idx} className="tool-call">
              Calling {part.toolName}...
            </div>
          );
        
        case 'tool-result':
          return (
            <div key={idx} className="tool-result">
              {part.toolName} returned: {JSON.stringify(part.result)}
            </div>
          );
        
        default:
          return null;
      }
    })}
  </div>
))}
```

**Key Points:**
- A single message can contain multiple parts
- Parts represent different content types (text, tool calls, tool results)
- The `parts` array maintains the order of content
- Proper rendering of parts creates a richer user experience
- Tool calls and results are automatically included in the parts array

---

### 5. React Hook: `useChat`

The `useChat` hook from `@ai-sdk/react` provides a complete solution for chat interfaces with minimal code.

#### Basic Usage

```typescript
import { useChat } from '@ai-sdk/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role}:</strong>
          {message.parts?.map((part, idx) => (
            part.type === 'text' ? <p key={idx}>{part.text}</p> : null
          ))}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

#### What `useChat` Provides

- `messages`: Array of all messages in the conversation
- `input`: Current input field value
- `handleInputChange`: Handler for input field changes
- `handleSubmit`: Handler for form submission
- `isLoading`: Boolean indicating if a request is in progress
- `error`: Any error that occurred during the request
- `reload`: Function to regenerate the last assistant message
- `stop`: Function to stop the current streaming response
- `append`: Function to add a new message programmatically

#### Custom Configuration

```typescript
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
  initialMessages: [],
  onFinish: (message) => {
    console.log('Message completed:', message);
  },
  onError: (error) => {
    console.error('Chat error:', error);
  },
});
```

**Key Points:**
- `useChat` automatically handles all streaming logic
- It manages message state, including tool calls and results
- The hook connects to your API route (defaults to `/api/chat`)
- Automatic error handling and retry logic
- Supports both text and tool call streaming
- Works seamlessly with `toDataStreamResponse()` from the backend

---

## 🔧 Project Structure

```
ai-sdk-workshop/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint with streamText
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── ChatInterface.tsx         # Chat UI with useChat and message.parts
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies (AI SDK v5)
└── README.md                     # This guide
```

---

## 📚 Additional Resources

- [AI SDK v5 Documentation](https://sdk.vercel.ai/docs)
- [AI SDK GitHub Repository](https://github.com/vercel/ai)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🎓 Workshop Flow

1. **Understand Model Providers** - Learn how to configure OpenAI and Anthropic
2. **Implement Streaming** - Use `streamText` to create streaming responses
3. **Add Tools** - Extend AI capabilities with tool calling
4. **Build the UI** - Use `useChat` and render `message.parts`
5. **Test & Experiment** - Try different models, tools, and prompts

---

## 🐛 Troubleshooting

- **API Key Error**: Ensure `.env.local` exists with valid API keys
- **Port Already in Use**: Run `npm run dev -- -p 3001` to use a different port
- **Build Errors**: Delete `node_modules` and `.next`, then run `npm install`
- **Tool Not Executing**: Check that your tool's `execute` function is async
- **Parts Not Rendering**: Ensure you're mapping over `message.parts`, not `message.content`

---

## 📝 License

This project is for educational purposes.


import { NextRequest } from "next/server";
import { convertToModelMessages, streamText, UIMessage, tool } from "ai";
import { z } from "zod";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
// TODO: Import necessary functions from the AI SDK
// Hint: You'll need streamText from 'ai'
// Hint: You'll need openai from '@ai-sdk/openai' or another provider

export async function POST(_req: NextRequest) {
  try {
    // TODO: Extract messages from the request body
    // const { messages } = await req.json();

    // TODO: Create a streaming response using the AI SDK
    // Hint: Use the streamText function
    // Hint: Configure your model (e.g., openai('gpt-4o-mini'))
    // Hint: Pass the messages to the model
    // Hint: Return the result with toDataStreamResponse()

    // const model = createOpenAI({
    //   apiKey: process.env.OPENAI_API_KEY!,
    // });

    const model = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    
    const { messages }: { messages: UIMessage[]} = await _req.json();
    const responseStream = await streamText({
      model: model("claude-3-haiku-20240307"),
      messages: convertToModelMessages(messages),
      tools: {
        squareRoot: tool({
          description: "Calculates the square root of a number to a certain number of decimal places.",
          inputSchema: z.object({
            number: z.number().describe("The number to calculate the square root of."),
            decimalPlaces: z.number().min(0).max(10).describe("The number of decimal places for the result."),
          }),
          outputSchema: z.object({
            result: z.number().describe("The square root of the input number."),
          }),
          execute: async ({ number, decimalPlaces }) => {
            const result = Math.sqrt(number);
            return {
              result: parseFloat(result.toFixed(decimalPlaces)),
            };
          },
        }),
        
      }
    });

    return responseStream.toUIMessageStreamResponse();


  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";

export default function ChatInterface() {
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    await sendMessage({
      text: input,
    });
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm mt-2">
              Type a message below to begin chatting with the AI.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                {message.parts?.map((part: any, idx: number) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <p
                          key={part.id ?? idx}
                          className="text-sm whitespace-pre-wrap"
                        >
                          {part.text}
                        </p>
                      );

                    case "tool-squareRoot": {
                      const callId = part.toolCallId;

                      switch (part.state) {
                        // case "input-streaming":
                        //   return (
                        //     <div key={callId} className="text-sm">
                        //       Preparing square root request...
                        //     </div>
                        //   );
                        // case "input-available": {
                        //   const n =
                        //     part.input?.number ??
                        //     part.input;
                        //   const dp =
                        //     part.input?.decimalPlaces ??
                        //     undefined;
                        //   return (
                        //     <div key={callId} className="text-sm">
                        //       {`Computing √${n}${
                        //         typeof dp === "number"
                        //           ? ` with ${dp} decimal places`
                        //           : ""
                        //       }...`}
                        //     </div>
                        //   );
                        // }
                        case "output-available":
                          return (
                            <div key={callId} className="text-sm">
                              Square root: {String(part.output?.result)}
                            </div>
                          );
                        case "output-error":
                          return (
                            <div key={callId} className="text-sm text-red-600">
                              Error: {part.errorText}
                            </div>
                          );
                        default:
                          return null;
                      }
                    }

                    default: {
                      // Fallback for unexpected part types
                      const text =
                        typeof part === "string"
                          ? part
                          : part.content ?? part.text ?? "";
                      return (
                        <p
                          key={part.id ?? idx}
                          className="text-sm whitespace-pre-wrap"
                        >
                          {text}
                        </p>
                      );
                    }
                  }
                })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

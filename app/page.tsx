import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI SDK Workshop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build a streaming chatbot with the Vercel AI SDK
          </p>
        </div>
        <ChatInterface />
      </main>
    </div>
  );
}

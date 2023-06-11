// langchain/chain.ts
import { VectorDBQAChain } from "langchain/chains"
import { ChatMessageHistory } from "langchain/memory"
import { mapStoredMessagesToChatMessages } from "@/lib/langchain/schema"
import { BufferMemory } from "langchain/memory"
import { BaseChatMessage, ChainValues } from "langchain/schema"
import { BaseLanguageModel } from "langchain/dist/base_language"
import { VectorStore } from "langchain/dist/vectorstores/base"

export function getChain(model: BaseLanguageModel, vectorStore: VectorStore, sanitizedQuestion: any, history: BaseChatMessage[]) {
  const lcChatMessageHistory = new ChatMessageHistory(
    mapStoredMessagesToChatMessages(history)
  )
  const memory = new BufferMemory({
    chatHistory: lcChatMessageHistory,
    returnMessages: true,
    memoryKey: "history",
  })

  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    returnSourceDocuments: true,
  })

  const response: string | ChainValues = chain.call({
    query: sanitizedQuestion,
    chat_history: history,
    memory: memory,
  })

  return response
}

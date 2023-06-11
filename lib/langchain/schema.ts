import { AIChatMessage, BaseChatMessage, HumanChatMessage, SystemChatMessage } from "langchain/schema"

export function mapStoredMessagesToChatMessages(
    messages: BaseChatMessage[]
  ): BaseChatMessage[] {
    return messages.map((message) => {
      switch (message.name) {
        case "human":
          return new HumanChatMessage(message.text)
        case "ai":
          return new AIChatMessage(message.text)
        case "system":
          return new SystemChatMessage(message.text)
        default:
          throw new Error("Role must be defined for generic messages")
      }
    })
  }
// langchain/model.ts
import { ChatOpenAI } from "langchain/chat_models/openai"
import { CallbackManager } from "langchain/callbacks"

export class ModelHandler {
  private string: string;
  private counter: number;
  private encoder: TextEncoder;
  private writer: any;

  constructor(writer: any) {
    this.string = "";
    this.counter = 0;
    this.encoder = new TextEncoder();
    this.writer = writer;
  }

  async handleLLMNewToken(token: string) {
    await this.writer.ready
    this.string += token
    this.counter++
    await this.writer.write(this.encoder.encode(`${token}`))
  }

  async handleLLMEnd() {
    await this.writer.ready
    await this.writer.close()
  }

  async handleLLMError(e) {
    await this.writer.ready
    console.log("handleLLMError Error: ", e)
    await this.writer.abort(e)
  }

  getModel(openaiApiKey) {
    return new ChatOpenAI({
      openAIApiKey: openaiApiKey,
      modelName: "gpt-4",
      temperature: 0.3,
      maxTokens: 1200,
      streaming: true, 
      maxRetries: 1,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: this.handleLLMNewToken.bind(this),
        handleLLMEnd: this.handleLLMEnd.bind(this),
        handleLLMError: this.handleLLMError.bind(this),
      }),
    })
  }
}

import { getChain } from "@/lib/langchain/chain"
import { ModelHandler } from "@/lib/langchain/model"
import { getPineconeStore } from "@/lib/langchain/vectorstores/pinecone"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Get credentials from ENV
  const credentials = {
    pineconeIndex: process.env.PINECONE_INDEX_NAME,
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseKey: process.env.SUPABASE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseBucket: process.env.SUPABASE_BUCKET,
    supabaseDatabaseUrl: process.env.DATABASE_URL,
    supabaseDirectUrl: process.env.DIRECT_URL
  }
  if (
    !credentials ||
    !credentials.pineconeIndex ||
    !credentials.pineconeEnvironment ||
    !credentials.pineconeApiKey
  ) {
    return NextResponse.redirect("/credentials")
  }

  const { prompt, messages: history } = body
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = `${prompt.trim().replaceAll("\n", " ")}`

  try {
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    const vectorStore = await getPineconeStore(credentials)

    const modelHandler = new ModelHandler(writer)
    const model = modelHandler.getModel(credentials.openaiApiKey)

    const response = getChain(model, vectorStore, sanitizedQuestion, history)

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    })
  } catch (error: any) {
    console.log("error", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}

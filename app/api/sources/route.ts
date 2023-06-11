import { NextRequest, NextResponse } from "next/server"
import { initPinecone } from "@/utils/pinecone-client"

import { OpenAIEmbeddings } from "langchain/embeddings/openai"

import { PineconeStore } from "langchain/vectorstores/pinecone"

import { PINECONE_NAME_SPACE } from "@/config/pinecone"

export const runtime = "edge"

export async function POST(req: NextRequest) {
    const body = await req.json();
 // Get credentials from cookies
  const credentials = JSON.parse(
    req.cookies.get("credentials")?.value || null
  )
  if (
    !credentials ||
    !credentials.pineconeIndex ||
    !credentials.pineconeEnvironment ||
    !credentials.pineconeApiKey
  ) {
    return NextResponse.redirect("/credentials")
  }

  const { openaiApiKey, pineconeEnvironment, pineconeIndex, pineconeApiKey } =
    credentials
  const pinecone = await initPinecone(pineconeEnvironment, pineconeApiKey)
  const { prompt, messages: history, id } = body
  
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = `${prompt.trim().replaceAll("\n", " ")}`
  try {
    const index = pinecone.Index(pineconeIndex)

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: openaiApiKey,
      }),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: id || PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    )
    const response = await vectorStore.similaritySearch(
      sanitizedQuestion,
    );
    
    return NextResponse.json(
      { sources: response }
    )
  } catch (error: any) {
    console.log("error", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"

import { createPrisma } from "@/lib/prisma"

// @ts-ignore
export async function GET(request: NextRequest, { params: { childId } }) {
  const credentials = {
    supabaseDatabaseUrl: process.env.DATABASE_URL,
  }
  const prisma = createPrisma({ url: credentials.supabaseDatabaseUrl })

  const data = await prisma.chatHistory.findMany({
    where: {
        childId,
    },
  })

  return NextResponse.json({ data })
}

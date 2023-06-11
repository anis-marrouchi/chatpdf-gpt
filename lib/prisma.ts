import { PrismaClient } from "@prisma/client"

export const createPrisma = ({url}) => {
    const opts  ={
    datasources: {
      db: {
        url,
      },
    },
  }
    const prisma = new PrismaClient(opts)
    return prisma
}
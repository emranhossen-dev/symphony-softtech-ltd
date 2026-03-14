import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  if (!globalForPrisma.prisma) {
    prisma = new PrismaClient({
      log: ['error']
    })
    globalForPrisma.prisma = prisma
  } else {
    prisma = globalForPrisma.prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  throw new Error('Database connection failed. Please check your DATABASE_URL configuration.')
}

export { prisma }

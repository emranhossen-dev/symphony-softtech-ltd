import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!globalForPrisma.prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
    globalForPrisma.prisma = prisma
    
    // Test the connection with retry logic
    const connectWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await prisma.$connect()
          console.log('Database connected successfully')
          return
        } catch (error) {
          console.error(`Database connection attempt ${i + 1} failed:`, error)
          if (i === retries - 1) {
            throw error
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
    
    connectWithRetry().catch((error) => {
      console.error('Failed to connect to database after retries:', error)
    })
  } else {
    prisma = globalForPrisma.prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  throw new Error('Database connection failed. Please check your DATABASE_URL configuration.')
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }

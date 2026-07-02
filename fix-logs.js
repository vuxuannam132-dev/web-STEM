const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.activityLog.updateMany({
    where: { type: 'UNLOCK_REQUEST' },
    data: { type: 'UNLOCK_REQUEST_RESOLVED' }
  })
  console.log('Updated', result.count, 'logs')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())

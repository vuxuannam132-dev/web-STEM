const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Bắt đầu reset database...\n')

  // Delete all Products
  const deletedProducts = await prisma.product.deleteMany({})
  console.log(`✅ Đã xóa ${deletedProducts.count} sản phẩm (Product)`)

  // Delete all ActivityLogs
  const deletedLogs = await prisma.activityLog.deleteMany({})
  console.log(`✅ Đã xóa ${deletedLogs.count} nhật ký hoạt động (ActivityLog)`)

  // Delete all PendingRegistrations
  const deletedPending = await prisma.pendingRegistration.deleteMany({})
  console.log(`✅ Đã xóa ${deletedPending.count} đăng ký chờ (PendingRegistration)`)

  // Delete all Users except ADMINs
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN',
      },
    },
  })
  console.log(`✅ Đã xóa ${deletedUsers.count} người dùng (không phải ADMIN)`)

  // SiteSettings are NOT touched
  const settingsCount = await prisma.siteSetting.count()
  console.log(`\nℹ️  Giữ nguyên ${settingsCount} cài đặt trang (SiteSetting)`)

  console.log('\n🎉 Reset database hoàn tất!')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi reset database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

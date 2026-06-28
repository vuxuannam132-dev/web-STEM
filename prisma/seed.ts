import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doanketstem.edu.vn' },
    update: {},
    create: {
      name: 'Admin STEM',
      email: 'admin@doanketstem.edu.vn',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Create a sample user
  const userHash = await bcrypt.hash('User@123456', 12)
  const user = await prisma.user.upsert({
    where: { email: 'hocsinh@doanketstem.edu.vn' },
    update: {},
    create: {
      name: 'Nguyễn Văn A',
      email: 'hocsinh@doanketstem.edu.vn',
      passwordHash: userHash,
      role: 'USER',
    },
  })

  // Sample products
  const products = [
    {
      title: 'Robot dò đường tự động',
      slug: 'robot-do-duong-tu-dong',
      description: 'Robot có khả năng tự động dò đường và tránh vật cản sử dụng cảm biến hồng ngoại và siêu âm. Sản phẩm được thiết kế để minh họa các nguyên lý cơ bản của robotics và lập trình nhúng, phù hợp cho học sinh THPT muốn tìm hiểu về công nghệ tự động hóa.',
      authors: JSON.stringify(['Nguyễn Văn A', 'Trần Thị B']),
      teachers: JSON.stringify(['Thầy Nguyễn Văn C']),
      appliedKnowledge: JSON.stringify(['Điện tử cơ bản', 'Lập trình Arduino', 'Vật lý - Cảm biến']),
      components: JSON.stringify(['Arduino Uno', 'Cảm biến siêu âm HC-SR04', 'Motor DC', 'Driver L298N', 'Pin 9V']),
      category: 'TOAN_LY_TIN',
      tags: JSON.stringify(['robot', 'arduino', 'tự động']),
      status: 'APPROVED',
      visibility: 'PUBLIC',
      viewCount: 156,
      ownerId: user.id,
    },
    {
      title: 'Hệ thống tưới cây thông minh',
      slug: 'he-thong-tuoi-cay-thong-minh',
      description: 'Hệ thống tưới cây tự động dựa trên cảm biến độ ẩm đất. Khi đất khô, hệ thống sẽ tự bơm nước và dừng khi đất đủ ẩm. Có thể theo dõi từ xa qua Blynk app trên điện thoại.',
      authors: JSON.stringify(['Lê Minh D', 'Phạm Thị E']),
      teachers: JSON.stringify(['Cô Trần Thị F']),
      appliedKnowledge: JSON.stringify(['IoT cơ bản', 'Sinh học - Nhu cầu nước của cây', 'Lập trình ESP32']),
      components: JSON.stringify(['ESP32', 'Cảm biến độ ẩm đất', 'Máy bơm mini', 'Relay 5V', 'Nguồn 12V']),
      category: 'KHOA_HOC_STEM',
      tags: JSON.stringify(['iot', 'nông nghiệp', 'tự động']),
      status: 'APPROVED',
      visibility: 'PUBLIC',
      viewCount: 234,
      ownerId: user.id,
    },
    {
      title: 'Mô hình nhà chống động đất',
      slug: 'mo-hinh-nha-chong-dong-dat',
      description: 'Mô hình thu nhỏ của một tòa nhà có hệ thống giảm chấn chống động đất. Sử dụng các nguyên lý vật lý về dao động và cộng hưởng để thiết kế hệ thống damper giảm rung hiệu quả.',
      authors: JSON.stringify(['Hoàng Văn G', 'Đinh Thị H']),
      teachers: JSON.stringify(['Thầy Vũ Văn I']),
      appliedKnowledge: JSON.stringify(['Vật lý - Dao động và sóng', 'Kỹ thuật xây dựng', 'Toán học - Tần số']),
      components: JSON.stringify(['Gỗ balsa', 'Lò xo giảm chấn', 'Bàn rung mô phỏng', 'Cảm biến gia tốc']),
      category: 'TOAN_LY_TIN',
      tags: JSON.stringify(['vật lý', 'kiến trúc', 'an toàn']),
      status: 'APPROVED',
      visibility: 'PUBLIC',
      viewCount: 89,
      ownerId: admin.id,
    },
    {
      title: 'Ứng dụng học tiếng Anh qua trò chơi',
      slug: 'ung-dung-hoc-tieng-anh-qua-tro-choi',
      description: 'Ứng dụng web giúp học sinh luyện từ vựng tiếng Anh thông qua các trò chơi tương tác như flashcard, quiz, và word matching. Được xây dựng bằng HTML, CSS, và JavaScript thuần.',
      authors: JSON.stringify(['Nguyễn Thị K']),
      teachers: JSON.stringify(['Cô Phạm Thị L']),
      appliedKnowledge: JSON.stringify(['Lập trình web', 'Thiết kế UX/UI', 'Ngôn ngữ học']),
      components: JSON.stringify(['HTML5', 'CSS3', 'JavaScript', 'LocalStorage API']),
      category: 'NGOAI_NGU_THE_DUC_GDQP',
      tags: JSON.stringify(['tiếng anh', 'web', 'gamification']),
      status: 'APPROVED',
      visibility: 'PUBLIC',
      viewCount: 312,
      ownerId: user.id,
    },
    {
      title: 'Bản đồ di tích lịch sử Hà Nội',
      slug: 'ban-do-di-tich-lich-su-ha-noi',
      description: 'Dự án tạo bản đồ tương tác trực tuyến đánh dấu các di tích lịch sử quan trọng của Hà Nội. Mỗi điểm đánh dấu có thông tin chi tiết, hình ảnh, và câu chuyện lịch sử liên quan.',
      authors: JSON.stringify(['Phạm Văn M', 'Lê Thị N']),
      teachers: JSON.stringify(['Thầy Đỗ Văn O']),
      appliedKnowledge: JSON.stringify(['Lịch sử Việt Nam', 'Địa lý', 'Công nghệ bản đồ số']),
      components: JSON.stringify(['Google Maps API', 'HTML/CSS', 'JavaScript', 'Dữ liệu di tích']),
      category: 'XA_HOI',
      tags: JSON.stringify(['lịch sử', 'bản đồ', 'hà nội']),
      status: 'APPROVED',
      visibility: 'PUBLIC',
      viewCount: 198,
      ownerId: admin.id,
    },
    {
      title: 'Máy phát điện mini từ năng lượng gió',
      slug: 'may-phat-dien-mini-tu-nang-luong-gio',
      description: 'Mô hình turbine gió thu nhỏ có thể phát điện để thắp sáng đèn LED. Dự án giúp học sinh hiểu về năng lượng tái tạo và nguyên lý phát điện từ chuyển động cơ học.',
      authors: JSON.stringify(['Trần Văn P', 'Hoàng Thị Q']),
      teachers: JSON.stringify(['Cô Nguyễn Thị R']),
      appliedKnowledge: JSON.stringify(['Vật lý - Điện từ', 'Năng lượng tái tạo', 'Thiết kế cơ khí']),
      components: JSON.stringify(['Motor DC (dùng ngược)', 'Cánh quạt', 'LED', 'Tụ điện', 'Khung gỗ']),
      category: 'KHOA_HOC_STEM',
      tags: JSON.stringify(['năng lượng', 'gió', 'điện']),
      status: 'PENDING',
      visibility: 'PUBLIC',
      viewCount: 0,
      ownerId: user.id,
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        images: JSON.stringify([]),
      },
    })
  }

  console.log('Seed completed!')
  console.log('Admin: admin@doanketstem.edu.vn / Admin@123456')
  console.log('User: hocsinh@doanketstem.edu.vn / User@123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

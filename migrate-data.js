// Script to migrate ALL data from local SQLite to Railway PostgreSQL
const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const pgUrl = 'postgresql://postgres:fNXMjgUriWUUIzXJdrrtYtnQpxTAALzG@gondola.proxy.rlwy.net:11763/railway';
const pg = new PrismaClient({ datasources: { db: { url: pgUrl } } });

async function main() {
  const sqlite = new Database('./prisma/dev.db', { readonly: true });

  // Clean PostgreSQL first (in reverse dependency order)
  console.log('🧹 Cleaning existing PostgreSQL data...');
  await pg.message.deleteMany();
  await pg.conversation.deleteMany();
  await pg.review.deleteMany();
  await pg.orderItem.deleteMany();
  await pg.order.deleteMany();
  await pg.product.deleteMany();
  await pg.category.deleteMany();
  await pg.user.deleteMany();
  console.log('   Done.\n');

  // 1. Users
  const users = sqlite.prepare('SELECT * FROM User').all();
  console.log(`👤 Migrating ${users.length} users...`);
  for (const u of users) {
    try {
      await pg.user.create({
        data: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role || 'Pembeli',
          password: u.password || null,
          phone: u.phone || null,
          address: u.address || null,
          avatar: u.avatar || null,
          isBlocked: u.isBlocked === 1 || u.isBlocked === true,
          isVerified: u.isVerified === 1 || u.isVerified === true,
          verificationStatus: u.verificationStatus || 'Unverified',
          ktpProof: u.ktpProof || null,
          productProof: u.productProof || null,
          productDescription: u.productDescription || null,
          coverImages: u.coverImages || null,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        }
      });
      console.log(`  ✓ ${u.name} (${u.email}) [${u.role}]`);
    } catch (e) {
      console.error(`  ✗ ${u.email}: ${e.message.split('\n')[0]}`);
    }
  }

  // 2. Categories
  const categories = sqlite.prepare('SELECT * FROM Category').all();
  console.log(`\n📁 Migrating ${categories.length} categories...`);
  for (const c of categories) {
    try {
      await pg.category.create({
        data: {
          id: c.id, name: c.name, slug: c.slug,
          description: c.description || null, icon: c.icon || null, color: c.color || null,
        }
      });
      console.log(`  ✓ ${c.name}`);
    } catch (e) { console.error(`  ✗ ${c.name}: ${e.message.split('\n')[0]}`); }
  }

  // 3. Products
  const products = sqlite.prepare('SELECT * FROM Product').all();
  console.log(`\n📦 Migrating ${products.length} products...`);
  for (const p of products) {
    try {
      await pg.product.create({
        data: {
          id: p.id, name: p.name, slug: p.slug, description: p.description,
          price: p.price, stock: p.stock || 0, image: p.image || null,
          images: p.images || null, video: p.video || null,
          rating: p.rating || 0, sold: p.sold || 0,
          featured: p.featured === 1 || p.featured === true,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          categoryId: p.categoryId, sellerId: p.sellerId,
        }
      });
      console.log(`  ✓ ${p.name}`);
    } catch (e) { console.error(`  ✗ ${p.name}: ${e.message.split('\n')[0]}`); }
  }

  // 4. Orders
  const orders = sqlite.prepare('SELECT * FROM "Order"').all();
  console.log(`\n🛒 Migrating ${orders.length} orders...`);
  for (const o of orders) {
    try {
      await pg.order.create({
        data: {
          id: o.id, userId: o.userId, sellerId: o.sellerId || null,
          totalAmount: o.totalAmount, paymentMethod: o.paymentMethod || 'COD',
          paymentProof: o.paymentProof || null, status: o.status || 'Pending',
          trackingNumber: o.trackingNumber || null,
          disbursementStatus: o.disbursementStatus || 'Pending',
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        }
      });
      console.log(`  ✓ ${o.id.substring(0,8)}...`);
    } catch (e) { console.error(`  ✗ ${o.id.substring(0,8)}: ${e.message.split('\n')[0]}`); }
  }

  // 5. OrderItems
  const items = sqlite.prepare('SELECT * FROM OrderItem').all();
  console.log(`\n📋 Migrating ${items.length} order items...`);
  for (const oi of items) {
    try {
      await pg.orderItem.create({
        data: { id: oi.id, orderId: oi.orderId, productId: oi.productId, quantity: oi.quantity, price: oi.price }
      });
      console.log(`  ✓ ${oi.id.substring(0,8)}...`);
    } catch (e) { console.error(`  ✗ ${oi.id.substring(0,8)}: ${e.message.split('\n')[0]}`); }
  }

  // 6. Reviews
  try {
    const reviews = sqlite.prepare('SELECT * FROM Review').all();
    console.log(`\n⭐ Migrating ${reviews.length} reviews...`);
    for (const r of reviews) {
      try {
        await pg.review.create({
          data: {
            id: r.id, rating: r.rating, comment: r.comment || null, images: r.images || null,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
            userId: r.userId, productId: r.productId, orderId: r.orderId,
          }
        });
        console.log(`  ✓ ${r.id.substring(0,8)}...`);
      } catch (e) { console.error(`  ✗ ${r.id.substring(0,8)}: ${e.message.split('\n')[0]}`); }
    }
  } catch (e) { console.log('No reviews found.'); }

  // 7. Conversations
  try {
    const convos = sqlite.prepare('SELECT * FROM Conversation').all();
    console.log(`\n💬 Migrating ${convos.length} conversations...`);
    for (const c of convos) {
      try {
        await pg.conversation.create({
          data: {
            id: c.id, user1Id: c.user1Id, user2Id: c.user2Id || null,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          }
        });
        console.log(`  ✓ ${c.id.substring(0,8)}...`);
      } catch (e) { console.error(`  ✗ ${c.id.substring(0,8)}: ${e.message.split('\n')[0]}`); }
    }
  } catch (e) { console.log('No conversations found.'); }

  // 8. Messages
  try {
    const messages = sqlite.prepare('SELECT * FROM Message').all();
    console.log(`\n✉️ Migrating ${messages.length} messages...`);
    for (const m of messages) {
      try {
        await pg.message.create({
          data: {
            id: m.id, content: m.content, senderId: m.senderId,
            isRead: m.isRead === 1 || m.isRead === true,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
            conversationId: m.conversationId,
          }
        });
        console.log(`  ✓ ${m.id.substring(0,8)}...`);
      } catch (e) { console.error(`  ✗ ${m.id.substring(0,8)}: ${e.message.split('\n')[0]}`); }
    }
  } catch (e) { console.log('No messages found.'); }

  console.log('\n✅ Migration complete!');
  await pg.$disconnect();
  sqlite.close();
}

main().catch(e => { console.error('Migration failed:', e); process.exit(1); });

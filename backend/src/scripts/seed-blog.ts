import { seedBlogPosts } from '../modules/blog/seed.js';

async function main() {
  try {
    console.log('🌱 Starting blog post seeding...');
    await seedBlogPosts();
    console.log('✅ Blog posts seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
    process.exit(1);
  }
}

main();

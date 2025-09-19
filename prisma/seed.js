const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create sample categories
  const categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Posts about technology, programming, and digital trends",
      color: "#3b82f6"
    },
    {
      name: "Web Development",
      slug: "web-development",
      description: "Frontend and backend development tutorials",
      color: "#10b981"
    },
    {
      name: "Design",
      slug: "design",
      description: "UI/UX design and visual design principles",
      color: "#f59e0b"
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create sample tags
  const tags = [
    { name: "React", slug: "react", color: "#61dafb" },
    { name: "Next.js", slug: "nextjs", color: "#000000" },
    { name: "TypeScript", slug: "typescript", color: "#3178c6" },
    { name: "JavaScript", slug: "javascript", color: "#f7df1e" },
    { name: "CSS", slug: "css", color: "#1572b6" },
    { name: "Node.js", slug: "nodejs", color: "#339933" },
    { name: "Prisma", slug: "prisma", color: "#2d3748" },
    { name: "Database", slug: "database", color: "#336791" }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Get created categories and tags
  const techCategory = await prisma.category.findUnique({ where: { slug: "technology" } });
  const webDevCategory = await prisma.category.findUnique({ where: { slug: "web-development" } });
  const designCategory = await prisma.category.findUnique({ where: { slug: "design" } });

  const reactTag = await prisma.tag.findUnique({ where: { slug: "react" } });
  const nextjsTag = await prisma.tag.findUnique({ where: { slug: "nextjs" } });
  const typescriptTag = await prisma.tag.findUnique({ where: { slug: "typescript" } });
  const prismaTag = await prisma.tag.findUnique({ where: { slug: "prisma" } });

  // Create sample posts with relationships
  const posts = [
    {
      title: "Getting Started with Next.js 14",
      slug: "getting-started-with-nextjs-14",
      content: `<h2>Introduction to Next.js 14</h2>
      <p>Next.js 14 brings exciting new features and improvements that make building React applications even more powerful and efficient. In this comprehensive guide, we'll explore the key features that make Next.js 14 a game-changer for modern web development.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>App Router:</strong> The new file-system based router built on React Server Components</li>
        <li><strong>Server Actions:</strong> Seamlessly call server-side functions from client components</li>
        <li><strong>Improved Performance:</strong> Better caching and optimization strategies</li>
        <li><strong>Enhanced Developer Experience:</strong> Better error handling and debugging tools</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>To create a new Next.js 14 project, run the following command:</p>
      <pre><code>npx create-next-app@latest my-app --typescript --tailwind --eslint</code></pre>
      
      <p>This will set up a new project with TypeScript, Tailwind CSS, and ESLint configured out of the box.</p>
      
      <h3>App Router vs Pages Router</h3>
      <p>Next.js 14 introduces the App Router as the recommended approach for new applications. The App Router provides:</p>
      <ul>
        <li>Better performance with React Server Components</li>
        <li>Improved SEO with built-in metadata API</li>
        <li>More intuitive file-based routing</li>
        <li>Enhanced loading and error handling</li>
      </ul>`,
      excerpt: "Learn about Next.js 14's powerful new features including the App Router, Server Actions, and performance improvements.",
      status: "PUBLISHED",
      featured: true,
      metaTitle: "Getting Started with Next.js 14 - Complete Guide",
      metaDescription: "Learn Next.js 14 from basics to advanced concepts including App Router, Server Actions, and performance optimization.",
      publishedAt: new Date(),
      categories: [techCategory.id, webDevCategory.id],
      tags: [nextjsTag.id, reactTag.id, typescriptTag.id]
    },
    {
      title: "Building a Full-Stack Blog with Prisma and Next.js",
      slug: "building-fullstack-blog-prisma-nextjs",
      content: `<h2>Why Choose Prisma for Your Next.js Blog?</h2>
      <p>Prisma is a next-generation database toolkit that makes database access easy, type-safe, and productive. When combined with Next.js, it creates a powerful full-stack development experience.</p>
      
      <h3>Setting Up Prisma</h3>
      <p>First, install Prisma in your Next.js project:</p>
      <pre><code>npm install prisma @prisma/client
npx prisma init</code></pre>
      
      <h3>Defining Your Schema</h3>
      <p>Create your database schema in <code>prisma/schema.prisma</code>:</p>
      <pre><code>model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}</code></pre>
      
      <h3>Database Operations</h3>
      <p>Prisma provides a type-safe client for all your database operations:</p>
      <pre><code>const posts = await prisma.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' }
})</code></pre>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Use Prisma migrations for schema changes</li>
        <li>Implement proper error handling</li>
        <li>Optimize queries with select and include</li>
        <li>Use connection pooling for production</li>
      </ul>`,
      excerpt: "Learn how to build a full-stack blog using Prisma ORM with Next.js for type-safe database operations.",
      status: "PUBLISHED",
      featured: false,
      metaTitle: "Building a Full-Stack Blog with Prisma and Next.js",
      metaDescription: "Complete guide to building a blog with Prisma ORM and Next.js including schema design and best practices.",
      publishedAt: new Date(),
      categories: [webDevCategory.id],
      tags: [prismaTag.id, nextjsTag.id, typescriptTag.id]
    },
    {
      title: "Modern UI Design Principles for Web Applications",
      slug: "modern-ui-design-principles-web-applications",
      content: `<h2>The Foundation of Great UI Design</h2>
      <p>Creating exceptional user interfaces requires understanding fundamental design principles and how they apply to modern web applications. Let's explore the key principles that make interfaces both beautiful and functional.</p>
      
      <h3>1. Visual Hierarchy</h3>
      <p>Visual hierarchy guides users through your interface by establishing a clear order of importance:</p>
      <ul>
        <li><strong>Typography:</strong> Use size, weight, and color to create hierarchy</li>
        <li><strong>Spacing:</strong> White space helps separate and group related elements</li>
        <li><strong>Color:</strong> Use contrast to highlight important elements</li>
      </ul>
      
      <h3>2. Consistency</h3>
      <p>Consistency builds user confidence and reduces cognitive load:</p>
      <ul>
        <li>Use a consistent color palette throughout your application</li>
        <li>Maintain consistent spacing and sizing patterns</li>
        <li>Apply consistent interaction patterns and behaviors</li>
      </ul>
      
      <h3>3. Accessibility</h3>
      <p>Design for all users by following accessibility guidelines:</p>
      <ul>
        <li>Ensure sufficient color contrast ratios</li>
        <li>Provide keyboard navigation support</li>
        <li>Use semantic HTML and ARIA labels</li>
        <li>Design for screen readers and assistive technologies</li>
      </ul>
      
      <h3>4. Mobile-First Design</h3>
      <p>Start with mobile constraints to create better experiences across all devices:</p>
      <ul>
        <li>Prioritize essential content and features</li>
        <li>Design touch-friendly interfaces</li>
        <li>Optimize for various screen sizes and orientations</li>
      </ul>`,
      excerpt: "Explore essential UI design principles for creating beautiful and functional web applications.",
      status: "DRAFT",
      featured: false,
      metaTitle: "Modern UI Design Principles for Web Applications",
      metaDescription: "Learn essential UI design principles including visual hierarchy, consistency, and accessibility for web applications.",
      categories: [designCategory.id],
      tags: []
    }
  ];

  for (const postData of posts) {
    const { categories: categoryIds, tags: tagIds, ...post } = postData;
    
    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        categories: {
          create: categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } }
          }))
        },
        tags: {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
    });
  }

  console.log('Database seeded successfully with categories, tags, and posts!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
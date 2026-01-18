import { createClient } from '@supabase/supabase-js';

type UnsplashPhoto = {
  id: string;
  urls: {
    regular: string;
  };
  links: {
    html: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
};

type CategorySeed = {
  name: string;
  slug: string;
  search: string;
  nouns: string[];
  baseTags: string[];
  collection: 'casual' | 'ethnic' | 'winter' | 'formal';
};

const categories: CategorySeed[] = [
  {
    name: 'T-Shirts',
    slug: 't-shirts',
    search: 't-shirt product',
    nouns: ['Crewneck Tee', 'Pocket Tee', 'Graphic Tee', 'Relaxed Tee', 'Essential Tee'],
    baseTags: ['casual'],
    collection: 'casual'
  },
  {
    name: 'Shirts',
    slug: 'shirts',
    search: 'shirt product',
    nouns: ['Oxford Shirt', 'Linen Shirt', 'Button Down Shirt', 'Poplin Shirt', 'Classic Shirt'],
    baseTags: ['formal'],
    collection: 'formal'
  },
  {
    name: 'Hoodies',
    slug: 'hoodies',
    search: 'hoodie product',
    nouns: ['Pullover Hoodie', 'Zip Hoodie', 'Fleece Hoodie', 'Street Hoodie', 'Oversized Hoodie'],
    baseTags: ['winter'],
    collection: 'winter'
  },
  {
    name: 'Jeans',
    slug: 'jeans',
    search: 'denim jeans',
    nouns: ['Slim Fit Jeans', 'Straight Jeans', 'Relaxed Jeans', 'Tapered Jeans', 'Wide Leg Jeans'],
    baseTags: ['casual'],
    collection: 'casual'
  },
  {
    name: 'Sarees',
    slug: 'sarees',
    search: 'saree fashion',
    nouns: ['Handloom Saree', 'Silk Saree', 'Cotton Saree', 'Chanderi Saree', 'Printed Saree'],
    baseTags: ['ethnic'],
    collection: 'ethnic'
  },
  {
    name: 'Kurtas',
    slug: 'kurtas',
    search: 'kurta fashion',
    nouns: ['Straight Kurta', 'Anarkali Kurta', 'Kurta Set', 'Short Kurta', 'Layered Kurta'],
    baseTags: ['ethnic'],
    collection: 'ethnic'
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    search: 'dress fashion',
    nouns: ['Midi Dress', 'Wrap Dress', 'Tiered Dress', 'Slip Dress', 'Shift Dress'],
    baseTags: ['formal'],
    collection: 'formal'
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    search: 'sneakers product',
    nouns: ['Everyday Sneakers', 'Canvas Sneakers', 'Slip On Shoes', 'Running Shoes', 'Low Top Sneakers'],
    baseTags: ['casual'],
    collection: 'casual'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    search: 'handbag accessory',
    nouns: ['Structured Tote', 'Crossbody Bag', 'Minimal Wallet', 'Everyday Belt', 'Classic Scarf'],
    baseTags: ['formal'],
    collection: 'formal'
  }
];

const adjectives = [
  'Classic',
  'Modern',
  'Heritage',
  'Everyday',
  'Signature',
  'Minimal',
  'Relaxed',
  'Tailored',
  'Vintage',
  'Studio'
];

const colorways = [
  'Ivory',
  'Sage',
  'Indigo',
  'Charcoal',
  'Sand',
  'Terracotta',
  'Midnight',
  'Olive',
  'Stone',
  'Blush'
];

const materials = [
  'cotton',
  'linen',
  'denim',
  'fleece',
  'khadi',
  'silk blend',
  'viscose',
  'organic cotton',
  'modal',
  'hemp blend'
];

const details = [
  'soft-touch finish',
  'relaxed drape',
  'structured tailoring',
  'breathable weave',
  'easy layering',
  'all-day comfort'
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pickFrom<T>(list: T[], index: number) {
  return list[index % list.length];
}

function buildTitle(category: CategorySeed, index: number) {
  const adjective = pickFrom(adjectives, index);
  const noun = pickFrom(category.nouns, index + 3);
  const color = pickFrom(colorways, index + 5);
  return `${adjective} ${noun} - ${color}`;
}

function buildDescription(title: string, index: number) {
  const material = pickFrom(materials, index + 2);
  const detail = pickFrom(details, index + 4);
  return `${title} crafted in ${material} with a ${detail}. Designed for effortless daily styling.`;
}

function buildTags(category: CategorySeed, index: number) {
  const tags = new Set<string>([...category.baseTags, category.collection]);
  if (index < 3) {
    tags.add('new');
  }
  if (index % 5 === 0) {
    tags.add('best');
  }
  return Array.from(tags);
}

function pickImages(pool: UnsplashPhoto[], index: number) {
  if (pool.length === 0) {
    return [];
  }
  const count = 2 + (index % 3);
  const start = (index * 3) % pool.length;
  const images: UnsplashPhoto[] = [];
  for (let i = 0; i < count; i += 1) {
    images.push(pool[(start + i) % pool.length]);
  }
  return images;
}

async function fetchUnsplash(search: string, accessKey: string) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', search);
  url.searchParams.set('per_page', '30');
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1'
    }
  });

  if (!response.ok) {
    throw new Error(`Unsplash request failed for ${search}: ${response.status}`);
  }

  const data = (await response.json()) as { results: UnsplashPhoto[] };
  return data.results || [];
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const seedCount = Number(process.env.SEED_COUNT || 90);

  if (!supabaseUrl || !supabaseKey || !unsplashKey) {
    throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or UNSPLASH_ACCESS_KEY.');
  }

  const total = Math.min(Math.max(seedCount, 80), 150);
  const perCategory = Math.ceil(total / categories.length);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const categoryPayload = categories.map((category) => ({
    name: category.name,
    slug: category.slug
  }));

  const { error: categoryError } = await supabase
    .from('categories')
    .upsert(categoryPayload, { onConflict: 'slug' });

  if (categoryError) {
    throw new Error(`Category upsert failed: ${categoryError.message}`);
  }

  const { data: categoryRows, error: categorySelectError } = await supabase
    .from('categories')
    .select('id, slug');

  if (categorySelectError || !categoryRows) {
    throw new Error(`Category fetch failed: ${categorySelectError?.message}`);
  }

  const categoryMap = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const imagePools = new Map<string, UnsplashPhoto[]>();
  for (const category of categories) {
    const pool = await fetchUnsplash(category.search, unsplashKey);
    imagePools.set(category.slug, pool);
  }

  const products: Array<Record<string, unknown>> = [];
  let created = 0;

  for (const category of categories) {
    const categoryId = categoryMap.get(category.slug);
    if (!categoryId) {
      continue;
    }
    const pool = imagePools.get(category.slug) || [];
    for (let i = 0; i < perCategory; i += 1) {
      if (created >= total) {
        break;
      }
      const title = buildTitle(category, i);
      const slug = slugify(`${title}-${category.slug}`);
      const description = buildDescription(title, i);
      const tags = buildTags(category, i);
      const is_featured = i % 7 === 0;
      const price = 399 + ((i * 97 + created * 13) % 2601);
      const stock = 5 + ((i * 11 + created * 7) % 76);
      const images = pickImages(pool, i);
      const image_urls = images.map((image) => image.urls.regular);
      const attribution = {
        source: 'unsplash',
        photos: images.map((image) => ({
          name: image.user.name,
          profile: `${image.user.links.html}?utm_source=adis_brand&utm_medium=referral`,
          link: `${image.links.html}?utm_source=adis_brand&utm_medium=referral`,
          image: image.urls.regular
        }))
      };

      products.push({
        title,
        slug,
        description,
        price_amount: price * 100,
        currency: 'INR',
        stock,
        is_active: true,
        is_featured,
        tags,
        category_id: categoryId,
        image_urls,
        attribution
      });

      created += 1;
    }
  }

  const batchSize = 40;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug' });
    if (error) {
      throw new Error(`Product upsert failed: ${error.message}`);
    }
  }

  console.log(`Seeded ${products.length} products across ${categories.length} categories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

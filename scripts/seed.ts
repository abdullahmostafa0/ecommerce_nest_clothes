import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { hash } from 'bcrypt';
import mongoose, { Schema, Types } from 'mongoose';

const configPath = existsSync(resolve('config/.env')) ? resolve('config/.env') : resolve('.env');
config({ path: configPath });

const databaseUrl = process.env.DB_MODE === 'local'
  ? process.env.DB_URL_LOCAL
  : process.env.DB_URL;

if (!databaseUrl) {
  throw new Error('Missing database connection string. Set DB_URL or DB_URL_LOCAL in the backend environment.');
}

const resolvedDatabaseUrl = databaseUrl;

const imageSchema = new Schema(
  {
    secure_url: String,
    public_id: String,
    folderId: String,
  },
  { _id: false },
);

const sizeSchema = new Schema(
  {
    size: String,
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const variantSchema = new Schema(
  {
    color: String,
    size: { type: [sizeSchema], default: [] },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, default: 'user' },
    favorites: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
  },
  { timestamps: true },
);

const categorySchema = new Schema(
  {
    nameArabic: { type: String, required: true, unique: true, trim: true },
    nameEnglish: { type: String, required: true, unique: true, trim: true },
    image: imageSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folderId: String,
    subCategories: { type: [Schema.Types.ObjectId], ref: 'SubCategory', default: [] },
  },
  { timestamps: true },
);

const subCategorySchema = new Schema(
  {
    nameArabic: { type: String, required: true, unique: true, trim: true },
    nameEnglish: { type: String, required: true, unique: true, trim: true },
    slugEnglish: { type: String, default: '' },
    slugArabic: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: imageSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folderId: String,
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    titleArabic: { type: String, required: true, trim: true },
    titleEnglish: { type: String, required: true, trim: true },
    descriptionArabic: { type: String, trim: true },
    descriptionEnglish: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    price: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    discountType: { type: String, default: 'percentage' },
    finalPrice: { type: Number },
    mainImage: imageSchema,
    subImages: { type: [imageSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    folderId: String,
    sellCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

async function seed() {
  try {
    await mongoose.connect(resolvedDatabaseUrl);

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    const SubCategory = mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    const adminEmail = 'admin@example.com';
    const adminPassword = await hash('Admin@12345', 10);

    await Promise.all([
      Product.deleteMany({ titleEnglish: { $in: ['Classic Linen Shirt', 'Tailored Denim Jacket', 'Minimal Knit Dress'] } }),
      SubCategory.deleteMany({ nameEnglish: { $in: ['Shirts', 'Outerwear', 'Dresses'] } }),
      Category.deleteMany({ nameEnglish: { $in: ['Women', 'Men'] } }),
      User.deleteOne({ email: adminEmail }),
    ]);

    const admin = await User.create({
      name: 'Seed Admin',
      email: adminEmail,
      password: adminPassword,
      phone: '+201000000000',
      address: 'Cairo, Egypt',
      role: 'superAdmin',
    });

    const womenCategory = await Category.create({
      nameArabic: 'نساء',
      nameEnglish: 'Women',
      createdBy: admin._id,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/women-category',
        folderId: 'seed',
      },
      folderId: 'seed',
    });

    const menCategory = await Category.create({
      nameArabic: 'رجال',
      nameEnglish: 'Men',
      createdBy: admin._id,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/men-category',
        folderId: 'seed',
      },
      folderId: 'seed',
    });

    const shirtsSubCategory = await SubCategory.create({
      nameArabic: 'قمصان',
      nameEnglish: 'Shirts',
      categoryId: menCategory._id,
      createdBy: admin._id,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/shirts-subcategory',
      },
      folderId: 'seed',
      slugEnglish: 'shirts',
      slugArabic: 'قمصان',
    });

    const outerwearSubCategory = await SubCategory.create({
      nameArabic: 'ملابس خارجية',
      nameEnglish: 'Outerwear',
      categoryId: menCategory._id,
      createdBy: admin._id,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/outerwear-subcategory',
      },
      folderId: 'seed',
      slugEnglish: 'outerwear',
      slugArabic: 'ملابس-خارجية',
    });

    const dressesSubCategory = await SubCategory.create({
      nameArabic: 'فساتين',
      nameEnglish: 'Dresses',
      categoryId: womenCategory._id,
      createdBy: admin._id,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/dresses-subcategory',
      },
      folderId: 'seed',
      slugEnglish: 'dresses',
      slugArabic: 'فساتين',
    });

    await Category.updateOne(
      { _id: womenCategory._id },
      { $set: { subCategories: [dressesSubCategory._id] } },
    );

    await Category.updateOne(
      { _id: menCategory._id },
      { $set: { subCategories: [shirtsSubCategory._id, outerwearSubCategory._id] } },
    );

    await Product.insertMany([
      {
        titleArabic: 'قميص كتان كلاسيكي',
        titleEnglish: 'Classic Linen Shirt',
        descriptionArabic: 'قميص خفيف ومريح مناسب للأيام الحارة.',
        descriptionEnglish: 'A lightweight, breathable shirt for warm days.',
        createdBy: admin._id,
        category: menCategory._id,
        subCategory: shirtsSubCategory._id,
        price: 1200,
        discount: 10,
        discountType: 'percentage',
        finalPrice: 1080,
        mainImage: {
          secure_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
          public_id: 'seed/classic-linen-shirt',
        },
        subImages: [],
        variants: [
          {
            color: 'White',
            size: [
              { size: 'M', stock: 8 },
              { size: 'L', stock: 6 },
            ],
          },
        ],
        folderId: 'seed',
        sellCount: 0,
      },
      {
        titleArabic: 'جاكيت دنيم أنيق',
        titleEnglish: 'Tailored Denim Jacket',
        descriptionArabic: 'جاكيت دنيم بتصميم حديث يناسب الإطلالات اليومية.',
        descriptionEnglish: 'A modern denim jacket with a tailored fit.',
        createdBy: admin._id,
        category: menCategory._id,
        subCategory: outerwearSubCategory._id,
        price: 1850,
        discount: 15,
        discountType: 'percentage',
        finalPrice: 1572.5,
        mainImage: {
          secure_url: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
          public_id: 'seed/tailored-denim-jacket',
        },
        subImages: [],
        variants: [
          {
            color: 'Indigo',
            size: [
              { size: 'L', stock: 5 },
              { size: 'XL', stock: 4 },
            ],
          },
        ],
        folderId: 'seed',
        sellCount: 0,
      },
      {
        titleArabic: 'فستان محايد بسيط',
        titleEnglish: 'Minimal Knit Dress',
        descriptionArabic: 'فستان ناعم ومريح مناسب للمناسبات اليومية.',
        descriptionEnglish: 'A soft, minimal dress for everyday wear.',
        createdBy: admin._id,
        category: womenCategory._id,
        subCategory: dressesSubCategory._id,
        price: 1450,
        discount: 15,
        discountType: 'percentage',
        finalPrice: 1232.5,
        mainImage: {
          secure_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          public_id: 'seed/minimal-knit-dress',
        },
        subImages: [],
        variants: [
          {
            color: 'Beige',
            size: [
              { size: 'S', stock: 7 },
              { size: 'M', stock: 7 },
            ],
          },
        ],
        folderId: 'seed',
        sellCount: 0,
      },
    ]);

    // Keep category counts in sync after insertions.
    await Category.updateMany({}, { $set: { updatedAt: new Date() } });

    console.log('Seed completed successfully.');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
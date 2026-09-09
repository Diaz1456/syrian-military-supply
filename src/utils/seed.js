require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');

const pic = (seed) => `https://picsum.photos/seed/${seed}/900/900`;

const SAMPLE_PRODUCTS = [
  {
    name: 'M65 Field Jacket',
    sku: 'SMS-APR-001',
    category: 'Tactical Apparel',
    price: 129.99,
    stock: 24,
    featured: true,
    description:
      'The classic M65 field jacket, reissued with a rugged cotton-nylon blend, heavy-duty zipper and zip-out insulated liner. Field tested, mission ready.',
    specs: { material: '50/50 cotton-nylon', weight: '1.8 kg', capacity: '4 exterior pockets', color: 'Olive Drab', origin: 'Local tailor workshop' },
    images: [{ url: pic('m65-field-jacket'), public_id: '' }],
  },
  {
    name: 'Tactical Cargo Pants',
    sku: 'SMS-APR-002',
    category: 'Tactical Apparel',
    price: 59.99,
    stock: 48,
    featured: true,
    description:
      'Ripstop cargo pants with reinforced knees, eight pockets and an adjustable waist. Cut for hard movement in rough terrain.',
    specs: { material: 'Ripstop cotton', weight: '720 g', capacity: '8 pockets', color: 'Coyote Tan', origin: 'Imported, locally finished' },
    images: [{ url: pic('tactical-cargo-pants'), public_id: '' }],
  },
  {
    name: 'Combat Boots (8" Desert Tan)',
    sku: 'SMS-FTW-001',
    category: 'Footwear',
    price: 149.99,
    stock: 18,
    featured: true,
    description: '8-inch desert combat boots with breathable lining, steel shank and lugged sole. Sized for real operators.',
    specs: { material: 'Full-grain leather / nylon', weight: '1.9 kg per pair', capacity: '8" height', color: 'Desert Tan', origin: 'Recon-issue standard' },
    images: [{ url: pic('combat-boots-desert'), public_id: '' }],
  },
  {
    name: 'MOLLE Assault Pack 40L',
    sku: 'SMS-GR-001',
    category: 'Gear & Packs',
    price: 89.99,
    stock: 32,
    salePrice: 74.99,
    description:
      '40-liter MOLLE assault pack with PALS webbing, hydration compartment, load-compression straps and a padded laptop sleeve.',
    specs: { material: '1000D nylon', weight: '1.4 kg', capacity: '40 L', color: 'Wolf Grey', origin: 'Field-tested import' },
    images: [{ url: pic('molle-assault-pack'), public_id: '' }],
  },
  {
    name: 'Plate Carrier Vest',
    sku: 'SMS-GR-002',
    category: 'Gear & Packs',
    price: 199.99,
    stock: 9,
    description:
      'Modern plate carrier with quick-release buckles, cummerbund and integrated MOLLE front and rear. Accepts standard SAPI plates.',
    specs: { material: '500D Cordura', weight: '1.1 kg (empty)', capacity: '10x12 plates', color: 'Black', origin: 'Spec-grade import' },
    images: [{ url: pic('plate-carrier-vest'), public_id: '' }],
  },
  {
    name: 'Red Dot Reflex Sight',
    sku: 'SMS-OPT-001',
    category: 'Optics',
    price: 249.99,
    stock: 14,
    salePrice: 219.99,
    description: 'Shock-proof red dot reflex sight with 2 MOA dot, multi-reticle option and 50k hour battery life. Water resistant.',
    specs: { material: '6061 aluminum', weight: '310 g', capacity: 'power: CR2032', color: 'Matte Black', origin: 'Range verified' },
    images: [{ url: pic('red-dot-sight'), public_id: '' }],
  },
  {
    name: '10x50 Binoculars',
    sku: 'SMS-OPT-002',
    category: 'Optics',
    price: 179.99,
    stock: 11,
    description: 'Fully multi-coated 10x50 roof-prism binoculars with rubber armor and phase-corrected glass. Built for long watches.',
    specs: { material: 'Rubber-armored alloy', weight: '890 g', capacity: '10x50', color: 'OD Green', origin: 'Field observed' },
    images: [{ url: pic('binoculars-10x50'), public_id: '' }],
  },
  {
    name: 'Damascus Steel Combat Knife',
    sku: 'SMS-KNT-001',
    category: 'Knives & Tools',
    price: 149.99,
    stock: 20,
    featured: true,
    description:
      'Hand-forged Damascus steel blade from local Syrian smiths. Folded steel pattern, full tang, leather-wrapped handle. A true local craft piece.',
    specs: { material: 'Damascus steel', weight: '420 g', capacity: 'blade: 15 cm', color: 'Pattern Steel', origin: 'Hand-forged in Damascus' },
    images: [{ url: pic('damascus-knife'), public_id: '' }],
  },
  {
    name: 'Multi-Tool (Mil-Spec)',
    sku: 'SMS-KNT-002',
    category: 'Knives & Tools',
    price: 49.99,
    stock: 40,
    salePrice: 39.99,
    description: 'Mil-spec multi-tool with pliers, knife, saw, file and screwdrivers in a locking stainless platform.',
    specs: { material: 'Stainless steel', weight: '240 g', capacity: '14 tools', color: 'Black Oxide', origin: 'Mil-spec stock' },
    images: [{ url: pic('multi-tool'), public_id: '' }],
  },
  {
    name: 'Vintage Surplus Helmet',
    sku: 'SMS-SUR-001',
    category: 'Surplus',
    price: 34.99,
    stock: 26,
    description: 'Vintage steel surplus helmet, genuine used condition with original patina and liner. Great for collectors and displays.',
    specs: { material: 'Steel + liner', weight: '1.3 kg', capacity: 'one size', color: 'Olive Drab', origin: 'Recovered store stock' },
    images: [{ url: pic('vintage-helmet'), public_id: '' }],
  },
  {
    name: 'Ammo Can (Metal, 50 Cal)',
    sku: 'SMS-SUR-002',
    category: 'Surplus',
    price: 19.99,
    stock: 75,
    description: 'Heavy gauge steel 50 cal ammo can with rubber gasket seal. Waterproof, stackable, endlessly useful.',
    specs: { material: 'Steel, OD paint', weight: '2.1 kg', capacity: 'approx. 12 L', color: 'Olive Drab', origin: 'Surplus stock' },
    images: [{ url: pic('ammo-can'), public_id: '' }],
  },
  {
    name: 'Morale Patch Set (5-pack)',
    sku: 'SMS-PTC-001',
    category: 'Patches & Morale',
    price: 12.99,
    stock: 90,
    description: 'Five tactical morale patches with hook-and-loop backing. Local embroidery workshop quality.',
    specs: { material: 'Embroidered thread', weight: '80 g', capacity: '5 patches', color: 'Assorted', origin: 'Local embroidery workshop' },
    images: [{ url: pic('morale-patches'), public_id: '' }],
  },
  {
    name: 'IFAK First Aid Kit',
    sku: 'SMS-MED-001',
    category: 'Medical & Survival',
    price: 79.99,
    stock: 15,
    salePrice: 69.99,
    description: 'Individual First Aid Kit with trauma dressings, tourniquet, chest seals and airway gear in a compact pouch.',
    specs: { material: 'Nylon pouch, medical-grade contents', weight: '540 g', capacity: '12 items', color: 'Black / OD', origin: 'Medic verified' },
    images: [{ url: pic('ifak-first-aid'), public_id: '' }],
  },
  {
    name: 'Emergency Survival Blanket',
    sku: 'SMS-MED-002',
    category: 'Medical & Survival',
    price: 9.99,
    stock: 120,
    description: 'Compact Mylar emergency blanket, wind and waterproof with high-vis side. Keeps you insulated in a pinch.',
    specs: { material: 'Mylar foil', weight: '60 g', capacity: '160 x 210 cm', color: 'Orange / Silver', origin: 'Survival stock' },
    images: [{ url: pic('survival-blanket'), public_id: '' }],
  },
  {
    name: 'Mechanix-Style Tactical Gloves',
    sku: 'SMS-APR-003',
    category: 'Tactical Apparel',
    price: 27.99,
    stock: 54,
    description: 'Breathable tactical gloves with synthetic leather palm, knuckle padding and adjustable wrist closure.',
    specs: { material: 'Mesh + synthetic leather', weight: '160 g', capacity: 'S–XXL', color: 'Black', origin: 'Import gear' },
    images: [{ url: pic('tactical-gloves'), public_id: '' }],
  },
  {
    name: 'Hydration Bladder 3L',
    sku: 'SMS-GR-003',
    category: 'Gear & Packs',
    price: 39.99,
    stock: 33,
    description: '3-liter hydration bladder with anti-microbial liner, bite valve and quick-release hose for any pack.',
    specs: { material: 'TPU (BPA-free)', weight: '220 g', capacity: '3 L', color: 'Clear / Black', origin: 'Field tested' },
    images: [{ url: pic('hydration-bladder'), public_id: '' }],
  },
];

async function seedDatabase() {
  const adminCreated = await seedAdmin();
  const products = await seedProducts();
  let settings = await Settings.findOne().sort({ createdAt: 1 });
  if (!settings) {
    settings = await Settings.create({});
  }
  return {
    admin: adminCreated,
    inserted: products.inserted,
    totalProducts: products.totalProducts,
    settings: settings.storeName,
  };
}

async function seedAdmin() {
  const username = 'admin';
  let admin = await Admin.findOne({ username });
  if (admin) {
    if (!(await bcrypt.compare('changeme123', admin.password))) {
      admin.password = bcrypt.hashSync('changeme123', 10);
      admin.forcePasswordChange = true;
      await admin.save();
    }
    return 'exists';
  }
  await Admin.create({
    username,
    password: bcrypt.hashSync('changeme123', 10),
    forcePasswordChange: true,
  });
  return 'created';
}

async function seedProducts() {
  let inserted = 0;
  for (const data of SAMPLE_PRODUCTS) {
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: data });
    } else {
      await Product.create(data);
      inserted += 1;
    }
  }
  return { totalProducts: await Product.countDocuments({}), inserted };
}

/* CLI usage:  npm run seed  */
if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Set MONGODB_URI first (copy .env.example to .env).');
      process.exit(1);
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('[seed] connected');
    const result = await seedDatabase();
    console.log('[seed] complete:', JSON.stringify(result));
    await mongoose.disconnect();
  })();
}

module.exports = { seedDatabase, SAMPLE_PRODUCTS };
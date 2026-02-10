import { db } from './index';
import { specialItemFees } from './schema';

async function seedSpecialItems() {
  console.log('🌱 Seeding special items...');

  try {
    const items = [
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone Series',
        minModel: '15',
        maxModel: '16',
        fixedFee: '45.00',
        description: 'iPhone 15 and 16 series (all models: Pro, Pro Max, Plus, standard)',
        itemName_fr: 'Série iPhone',
        itemName_ht: 'Seri iPhone',
        itemName_es: 'Serie iPhone',
        description_fr: 'iPhone 15 et 16 séries (tous les modèles: Pro, Pro Max, Plus, standard)',
        description_ht: 'iPhone 15 ak 16 seri (tout modèl: Pro, Pro Max, Plus, estanda)',
        description_es: 'iPhone 15 y 16 series (todos los modelos: Pro, Pro Max, Plus, estándar)',
        imageUrl: 'https://via.placeholder.com/200/0066CC/FFFFFF?text=iPhone',
        isActive: true,
        createdBy: 1, // Admin ID
      },
      {
        category: 'phone',
        brand: 'Samsung',
        itemName: 'Samsung Galaxy S24',
        minModel: 'S24',
        maxModel: 'S24 Ultra',
        fixedFee: '40.00',
        description: 'Samsung Galaxy S24 series (S24, S24+, S24 Ultra)',
        itemName_fr: 'Samsung Galaxy S24',
        itemName_ht: 'Samsung Galaxy S24',
        itemName_es: 'Samsung Galaxy S24',
        description_fr: 'Samsung Galaxy S24 série (S24, S24+, S24 Ultra)',
        description_ht: 'Samsung Galaxy S24 seri (S24, S24+, S24 Ultra)',
        description_es: 'Samsung Galaxy S24 serie (S24, S24+, S24 Ultra)',
        imageUrl: 'https://via.placeholder.com/200/1428A0/FFFFFF?text=Galaxy+S24',
        isActive: true,
        createdBy: 1,
      },
      {
        category: 'tablet',
        brand: 'Apple',
        itemName: 'iPad',
        minModel: 'iPad 9',
        maxModel: 'iPad Pro',
        fixedFee: '55.00',
        description: 'All iPad models (iPad, iPad Air, iPad Pro, iPad Mini)',
        itemName_fr: 'iPad',
        itemName_ht: 'iPad',
        itemName_es: 'iPad',
        description_fr: 'Tous les modèles iPad (iPad, iPad Air, iPad Pro, iPad Mini)',
        description_ht: 'Tout modèl iPad (iPad, iPad Air, iPad Pro, iPad Mini)',
        description_es: 'Todos los modelos iPad (iPad, iPad Air, iPad Pro, iPad Mini)',
        imageUrl: 'https://via.placeholder.com/200/5E5CE6/FFFFFF?text=iPad',
        isActive: true,
        createdBy: 1,
      },
      {
        category: 'satellite',
        brand: 'SpaceX',
        itemName: 'Starlink Kit',
        minModel: 'Standard',
        maxModel: 'High Performance',
        fixedFee: '120.00',
        description: 'Starlink satellite internet kit (includes dish, router, cables)',
        itemName_fr: 'Kit Starlink',
        itemName_ht: 'Kit Starlink',
        itemName_es: 'Kit Starlink',
        description_fr: 'Kit internet satellite Starlink (antenne, routeur, câbles)',
        description_ht: 'Kit entènèt satèlit Starlink (antèn, routè, kab)',
        description_es: 'Kit internet satélite Starlink (antena, router, cables)',
        imageUrl: 'https://via.placeholder.com/200/000000/FFFFFF?text=Starlink',
        isActive: true,
        createdBy: 1,
      },
      {
        category: 'electronics',
        brand: 'Apple',
        itemName: 'MacBook',
        minModel: 'MacBook Air',
        maxModel: 'MacBook Pro 16"',
        fixedFee: '85.00',
        description: 'All MacBook models (Air, Pro 13", Pro 14", Pro 16")',
        itemName_fr: 'MacBook',
        itemName_ht: 'MacBook',
        itemName_es: 'MacBook',
        description_fr: 'Tous les modèles MacBook (Air, Pro 13", Pro 14", Pro 16")',
        description_ht: 'Tout modèl MacBook (Air, Pro 13", Pro 14", Pro 16")',
        description_es: 'Todos los modelos MacBook (Air, Pro 13", Pro 14", Pro 16")',
        imageUrl: 'https://via.placeholder.com/200/BF5AF2/FFFFFF?text=MacBook',
        isActive: true,
        createdBy: 1,
      },
    ];

    for (const item of items) {
      await db.insert(specialItemFees).values(item);
      console.log(`✓ Added: ${item.itemName} (${item.brand}) - $${item.fixedFee}`);
    }

    console.log('\n✅ Successfully seeded', items.length, 'special items!');
  } catch (error) {
    console.error('❌ Error seeding special items:', error);
    throw error;
  }
}

seedSpecialItems()
  .then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });

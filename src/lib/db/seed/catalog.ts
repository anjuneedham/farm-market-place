import type { Category, Product } from '@/lib/types';
import { slugify } from './helpers';

type CategorySeed = {
  name: string;
  icon: string;
  description: string;
  children: string[];
};

const TREE: CategorySeed[] = [
  {
    name: 'Fresh Produce',
    icon: 'sprout',
    description: 'Vegetables, fruit, ground provisions, herbs and spices straight from the field.',
    children: [
      'Vegetables',
      'Fruits',
      'Root Crops',
      'Tubers',
      'Herbs',
      'Spices',
      'Grains',
      'Legumes',
    ],
  },
  {
    name: 'Livestock',
    icon: 'beef',
    description: 'Live animals, meat and fish from farmers and fisherfolk across the island.',
    children: ['Chicken', 'Goat', 'Sheep', 'Cattle', 'Pigs', 'Fish', 'Other Livestock'],
  },
  {
    name: 'Farm Products',
    icon: 'egg',
    description: 'Eggs, honey, coconut products, sauces, preserves and processed foods.',
    children: [
      'Eggs',
      'Honey',
      'Coconut Products',
      'Pepper Sauces',
      'Jams & Preserves',
      'Processed Foods',
      'Natural Products',
    ],
  },
  {
    name: 'Agricultural Supplies',
    icon: 'package',
    description: 'Seeds, fertiliser, feed, tools and everything needed to plant and grow.',
    children: [
      'Seeds',
      'Fertilizer',
      'Feed',
      'Tools',
      'Irrigation',
      'Greenhouse Supplies',
      'Planting Materials',
    ],
  },
  {
    name: 'Equipment',
    icon: 'tractor',
    description: 'Tractors, pumps, machinery and harvesting equipment for sale or hire.',
    children: ['Tractors', 'Pumps', 'Machinery', 'Harvesting Equipment', 'Farm Equipment'],
  },
  {
    name: 'Services',
    icon: 'wrench',
    description: 'Land preparation, transport, veterinary care, labour and consulting.',
    children: [
      'Tractor Services',
      'Land Preparation',
      'Transportation',
      'Veterinary Services',
      'Farm Labour',
      'Agricultural Consulting',
      'Irrigation Services',
    ],
  },
];

export function seedCategories(): Category[] {
  const categories: Category[] = [];

  TREE.forEach((parent, parentIndex) => {
    const parentSlug = slugify(parent.name);
    const parentId = `cat_${parentSlug}`;
    categories.push({
      id: parentId,
      name: parent.name,
      slug: parentSlug,
      description: parent.description,
      icon: parent.icon,
      level: 0,
      sortOrder: parentIndex,
      isActive: true,
    });

    parent.children.forEach((child, childIndex) => {
      const childSlug = slugify(child);
      categories.push({
        id: `cat_${childSlug}`,
        parentId,
        name: child,
        slug: childSlug,
        level: 1,
        sortOrder: childIndex,
        isActive: true,
      });
    });
  });

  return categories;
}

type ProductSeed = [name: string, categorySlug: string, unit: string, synonyms?: string[]];

/**
 * The shared product catalogue. Listings reference these so that "pepper" is
 * one concept island-wide — which is what makes clean URLs, synonym search and
 * (later) real price aggregation possible at all.
 */
const PRODUCTS: ProductSeed[] = [
  // Vegetables
  ['Tomato', 'vegetables', 'lb', ['tomatoes', 'plum tomato']],
  ['Sweet Pepper', 'vegetables', 'lb', ['bell pepper', 'sweet peppers']],
  ['Scotch Bonnet Pepper', 'vegetables', 'lb', ['scotch bonnet', 'hot pepper', 'pepper']],
  ['Cucumber', 'vegetables', 'lb', ['cucumbers']],
  ['Cabbage', 'vegetables', 'lb', ['cabbages']],
  ['Lettuce', 'vegetables', 'lb', ['leaf lettuce', 'romaine']],
  ['Callaloo', 'vegetables', 'bundle', ['amaranth']],
  ['Pak Choi', 'vegetables', 'lb', ['bok choy', 'pak choy']],
  ['Pumpkin', 'vegetables', 'lb', ['calabaza']],
  ['String Bean', 'vegetables', 'lb', ['green beans', 'snap beans']],
  ['Okra', 'vegetables', 'lb', ['ochro', 'ladies fingers']],
  ['Carrot', 'vegetables', 'lb', ['carrots']],
  ['Onion', 'vegetables', 'lb', ['onions']],
  ['Escallion', 'vegetables', 'bundle', ['scallion', 'spring onion']],
  // Fruits
  ['Banana', 'fruits', 'lb', ['bananas']],
  ['Plantain', 'fruits', 'lb', ['plantains', 'green plantain']],
  ['Pineapple', 'fruits', 'each', ['pineapples']],
  ['Mango', 'fruits', 'lb', ['mangoes', 'julie mango', 'east indian mango']],
  ['Ackee', 'fruits', 'lb', ['ackees']],
  ['Papaya', 'fruits', 'lb', ['pawpaw']],
  ['Watermelon', 'fruits', 'lb', ['melon']],
  ['Otaheite Apple', 'fruits', 'lb', ['otaheite', 'jamaican apple']],
  ['Soursop', 'fruits', 'lb', ['guanabana']],
  ['Naseberry', 'fruits', 'lb', ['sapodilla']],
  ['Breadfruit', 'fruits', 'each', ['breadfruits']],
  // Root crops and tubers
  ['Yellow Yam', 'root-crops', 'lb', ['yam', 'yellow yams']],
  ['Sweet Potato', 'tubers', 'lb', ['sweet potatoes', 'sweet yam']],
  ['Irish Potato', 'tubers', 'lb', ['potato', 'potatoes']],
  ['Dasheen', 'root-crops', 'lb', ['taro', 'coco']],
  ['Cassava', 'root-crops', 'lb', ['yuca', 'bitter cassava']],
  ['Ginger', 'root-crops', 'lb', ['ginger root']],
  ['Turmeric', 'root-crops', 'lb', ['tumeric']],
  // Herbs, spices, grains, legumes
  ['Thyme', 'herbs', 'bundle', ['fresh thyme']],
  ['Mint', 'herbs', 'bundle', ['peppermint']],
  ['Pimento', 'spices', 'lb', ['allspice']],
  ['Nutmeg', 'spices', 'lb', []],
  ['Rice', 'grains', 'lb', []],
  ['Corn', 'grains', 'lb', ['maize']],
  ['Red Peas', 'legumes', 'lb', ['kidney beans', 'red kidney beans']],
  ['Gungo Peas', 'legumes', 'lb', ['pigeon peas', 'gungo']],
  // Livestock
  ['Live Chicken', 'chicken', 'each', ['broiler', 'fowl']],
  ['Dressed Chicken', 'chicken', 'lb', ['chicken meat']],
  ['Goat', 'goat', 'each', ['live goat', 'ram goat']],
  ['Sheep', 'sheep', 'each', ['lamb']],
  ['Cattle', 'cattle', 'each', ['cow', 'bull', 'heifer']],
  ['Pig', 'pigs', 'each', ['hog', 'pork']],
  ['Tilapia', 'fish', 'lb', ['pond fish']],
  ['Snapper', 'fish', 'lb', ['red snapper']],
  // Farm products
  ['Eggs', 'eggs', 'dozen', ['fresh eggs', 'brown eggs']],
  ['Honey', 'honey', 'bottle', ['raw honey', 'natural honey']],
  ['Coconut Oil', 'coconut-products', 'bottle', ['virgin coconut oil']],
  ['Dry Coconut', 'coconut-products', 'each', ['coconut', 'coconuts']],
  ['Pepper Sauce', 'pepper-sauces', 'bottle', ['hot sauce', 'scotch bonnet sauce']],
  ['Guava Jam', 'jams-and-preserves', 'jar', ['jam', 'preserve']],
  ['Cassava Bammy', 'processed-foods', 'pack', ['bammy']],
  ['Castor Oil', 'natural-products', 'bottle', ['black castor oil']],
  // Supplies and equipment
  ['Vegetable Seeds', 'seeds', 'pack', ['seed', 'seedlings']],
  ['NPK Fertilizer', 'fertilizer', 'bag', ['fertiliser', 'npk']],
  ['Layer Feed', 'feed', 'bag', ['chicken feed', 'poultry feed']],
  ['Drip Irrigation Kit', 'irrigation', 'kit', ['drip line', 'irrigation kit']],
  ['Shade Net', 'greenhouse-supplies', 'roll', ['shade cloth']],
  ['Knapsack Sprayer', 'tools', 'each', ['sprayer', 'backpack sprayer']],
  ['Water Pump', 'pumps', 'each', ['pump', 'irrigation pump']],
  ['Compact Tractor', 'tractors', 'each', ['tractor']],
  // Services
  ['Land Ploughing Service', 'land-preparation', 'acre', ['ploughing', 'tilling', 'land prep']],
  ['Produce Transport', 'transportation', 'trip', ['trucking', 'delivery', 'haulage']],
  ['Veterinary Visit', 'veterinary-services', 'visit', ['vet', 'animal health']],
  ['Farm Labour Crew', 'farm-labour', 'day', ['labour', 'workers', 'reaping crew']],
  ['Agronomy Consulting', 'agricultural-consulting', 'session', ['consulting', 'agronomist']],
];

export function seedProducts(): Product[] {
  return PRODUCTS.map(([name, categorySlug, unit, synonyms]) => ({
    id: `prod_${slugify(name)}`,
    categoryId: `cat_${categorySlug}`,
    name,
    slug: slugify(name),
    synonyms: synonyms ?? [],
    defaultUnit: unit,
    status: 'ACTIVE' as const,
  }));
}

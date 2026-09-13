import { data, mutate } from '../datasource';
import type { Category, Product } from '@/lib/types';
import { newId, normalise, slugify } from './common';

export const catalog = {
  categories(): Category[] {
    return [...data().categories]
      .filter((c) => c.isActive)
      .sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder);
  },

  topLevel(): Category[] {
    return this.categories().filter((c) => c.level === 0);
  },

  childrenOf(parentId: string): Category[] {
    return this.categories().filter((c) => c.parentId === parentId);
  },

  byId(id: string): Category | undefined {
    return data().categories.find((c) => c.id === id);
  },

  bySlug(slug: string): Category | undefined {
    return data().categories.find((c) => c.slug === slug);
  },

  parentOf(category: Category): Category | undefined {
    return category.parentId ? this.byId(category.parentId) : undefined;
  },

  /** A category plus all of its descendants — what "browse Fresh Produce" means. */
  withDescendantIds(categoryId: string): string[] {
    const ids = [categoryId];
    for (const child of this.childrenOf(categoryId)) ids.push(child.id);
    return ids;
  },

  breadcrumb(categoryId: string): Category[] {
    const category = this.byId(categoryId);
    if (!category) return [];
    const parent = this.parentOf(category);
    return parent ? [parent, category] : [category];
  },

  updateCategory(id: string, patch: Partial<Category>): Category | undefined {
    return mutate((db) => {
      const category = db.categories.find((c) => c.id === id);
      if (!category) return undefined;
      Object.assign(category, patch);
      return category;
    });
  },

  products(categoryId?: string): Product[] {
    const items = data().products.filter((p) => p.status === 'ACTIVE');
    return (categoryId ? items.filter((p) => p.categoryId === categoryId) : items).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  },

  pendingProducts(): Product[] {
    return data().products.filter((p) => p.status === 'PENDING');
  },

  productById(id: string): Product | undefined {
    return data().products.find((p) => p.id === id);
  },

  productBySlug(slug: string): Product | undefined {
    return data().products.find((p) => p.slug === slug);
  },

  /** Synonym-aware lookup: "hot pepper" resolves to Scotch Bonnet Pepper. */
  findProductsByTerm(term: string): Product[] {
    const needle = normalise(term);
    if (!needle) return [];
    return data().products.filter((product) => {
      if (product.status !== 'ACTIVE') return false;
      if (normalise(product.name).includes(needle)) return true;
      return product.synonyms.some((synonym) => normalise(synonym).includes(needle));
    });
  },

  /**
   * Sellers may propose a product that is not in the catalogue. It lands in the
   * admin review queue rather than blocking the listing.
   */
  proposeProduct(name: string, categoryId: string, defaultUnit: string): Product {
    return mutate((db) => {
      const existing = db.products.find((p) => p.slug === slugify(name));
      if (existing) return existing;

      const product: Product = {
        id: newId('prod'),
        categoryId,
        name: name.trim(),
        slug: slugify(name),
        synonyms: [],
        defaultUnit,
        status: 'PENDING',
      };
      db.products.push(product);
      return product;
    });
  },

  setProductStatus(id: string, status: Product['status']): Product | undefined {
    return mutate((db) => {
      const product = db.products.find((p) => p.id === id);
      if (!product) return undefined;
      product.status = status;
      return product;
    });
  },
};

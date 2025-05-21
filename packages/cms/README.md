# CMS Package

This package provides a clean, type-safe interface for interacting with the Strapi CMS.

## Features

- Type-safe API for Strapi CMS
- Based on the official `@strapi/client` library
- Provides high-level services for listings, categories, and more
- Includes query builders for complex filtering and sorting
- Proper handling of relational data

## Usage

### Basic API Usage

```typescript
import { strapiClient, strapiCollections, strapiSingles } from '@repo/cms';

// Use collection type resources
const listings = await strapiCollections.listings().find({
  filters: {
    status: { $eq: 'published' }
  },
  sort: ['createdAt:desc'],
  pagination: {
    page: 1,
    pageSize: 10
  },
  populate: {
    images: true,
    categories: {
      populate: ['attributes']
    }
  }
});

// Use single type resources
const homepage = await strapiSingles.homepage().find({
  populate: ['hero', 'sections']
});

// Access media library
const images = await strapiClient.files.find({
  filters: {
    mime: { $contains: 'image' }
  }
});
```

### Using Service Classes

The package provides class-based services for common content types:

```typescript
import { listingService, categoryService } from '@repo/cms';

// Using the ListingService
const listings = await listingService.getListings({
  page: 1,
  pageSize: 10,
  sort: 'createdAt:desc',
  category: 'electronics'
});

// Create a listing with related data (handles relations automatically)
const newListing = await listingService.createListing({
  title: 'iPhone 15 Pro Max',
  description: 'Brand new in box',
  price: 1199.99,
  location: 'New York',
  slug: 'iphone-15-pro-max',
  status: 'published',
  categories: [5, 8], // Category IDs
  images: [12, 13], // Image IDs
  attributeValues: [
    { attributeDocumentId: 3, value: 'Black' },
    { attributeDocumentId: 4, value: '512GB' }
  ]
});

// Using the CategoryService
const categories = await categoryService.getRootCategories();

// Create a category with related data
const newCategory = await categoryService.createCategory({
  name: 'Smartphones',
  slug: 'smartphones',
  description: 'Mobile phones and accessories',
  parentId: '2', // Parent category ID
  iconId: 7, // Icon image ID
  attributeDocumentIds: [1, 2, 3] // Attribute IDs
});
```

### Backward Compatible Function Exports

Individual functions are also exported for backward compatibility:

```typescript
import { getListings, getListingBySlug, createCategory } from '@repo/cms';

// Get all published listings with pagination
const listings = await getListings({
  page: 1,
  pageSize: 10,
  sort: 'createdAt:desc',
  category: 'electronics'
});

// Get a single listing by slug
const listing = await getListingBySlug('iphone-15-pro-max');

// Create a category
const category = await createCategory({
  name: 'Electronics',
  slug: 'electronics'
});
```

## Configuration

The Strapi client is configured using environment variables:

- `NEXT_PUBLIC_STRAPI_URL`: The URL of your Strapi instance
- `STRAPI_TOKEN`: The API token for authentication

## Query Builder

You can use the query builder to create complex queries:

```typescript
import { StrapiQueryBuilder } from '@repo/cms';

const query = new StrapiQueryBuilder()
  .paginate(1, 10)
  .sort('title:asc')
  .where({
    categories: {
      slug: { $eq: 'electronics' }
    }
  })
  .populate({
    images: true,
    categories: true
  });

// Get query as object for @strapi/client
const queryParams = query.buildObject();
const result = await strapiCollections.listings().find(queryParams);
```

## API Documentation

For more details on the Strapi API, see the [Strapi documentation](https://docs.strapi.io/dev-docs/api/rest). 

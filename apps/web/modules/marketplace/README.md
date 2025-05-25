# Marketplace Module - Refactored Architecture

This module provides a clean, maintainable architecture for managing categories and attributes in the marketplace application.

## Architecture Overview

The module is organized into clear layers with separation of concerns:

### 📁 Structure

```
marketplace/
├── data/           # Data layer - API services and hooks
├── state/          # State management - Context providers and reducers  
├── lib/            # Business logic - Pure utility functions
├── components/     # UI layer - Reusable components
└── examples/       # Usage examples and documentation
```

### 🏗️ Layers

#### 1. **Data Layer** (`/data/`)
- **Services**: Clean interfaces for API operations
- **Hooks**: React Query hooks with proper caching
- **Normalized data structures** for consistent interfaces

#### 2. **State Management Layer** (`/state/`)
- **Context providers** for global state
- **Reducers** for predictable state updates
- **Custom hooks** for easy state access

#### 3. **Business Logic Layer** (`/lib/`)
- **Pure functions** for data transformations
- **Validation utilities** for form and filter data
- **Type-safe operations** for attributes and categories

#### 4. **UI Layer** (`/components/`)
- **Presentational components** that only handle rendering
- **Container components** that connect to state and logic
- **Composable and reusable** component design

## Key Components

### CategorySelector

Clean component for hierarchical category selection.

```tsx
import { CategorySelector, CategorySelectionProvider } from '@marketplace';

function MyComponent() {
  return (
    <CategorySelectionProvider>
      <CategorySelector
        label="Select Categories"
        allowSelectAll={true}
        onSelectionChange={(primary, subcategory) => {
          console.log('Selected:', { primary, subcategory });
        }}
      />
    </CategorySelectionProvider>
  );
}
```

### AttributeManager

Manages dynamic attributes based on selected categories.

```tsx
import { AttributeManager } from '@marketplace';

function MyForm() {
  return (
    <AttributeManager
      isFilter={false} // Set to true for filtering use
      onChange={(documentId, name, value) => {
        console.log('Attribute changed:', { documentId, name, value });
      }}
      onBatchUpdate={(attributes) => {
        console.log('All attributes:', attributes);
      }}
    />
  );
}
```

## Usage Patterns

### 1. Listing Filters

```tsx
import { 
  CategorySelectionProvider,
  CategorySelector,
  AttributeManager 
} from '@marketplace';

function ListingFilters() {
  return (
    <CategorySelectionProvider>
      <div className="space-y-6">
        <CategorySelector
          allowSelectAll={true}
          onSelectionChange={(primary, subcategory) => {
            // Handle category filter changes
          }}
        />
        
        <AttributeManager
          isFilter={true}
          onChange={(documentId, name, value) => {
            // Handle attribute filter changes
          }}
        />
      </div>
    </CategorySelectionProvider>
  );
}
```

### 2. Listing Form

```tsx
import { 
  CategorySelectionProvider,
  CategorySelector,
  AttributeManager 
} from '@marketplace';

function ListingForm() {
  return (
    <CategorySelectionProvider>
      <form>
        <CategorySelector
          onSelectionChange={(primary, subcategory) => {
            // Update form categories
          }}
        />
        
        <AttributeManager
          isFilter={false}
          onBatchUpdate={(attributes) => {
            // Update form attributes
          }}
        />
      </form>
    </CategorySelectionProvider>
  );
}
```

## Migration Guide

### From Old Architecture

The new architecture is designed to be backward compatible during migration:

```tsx
// Old way
import { CategorySelector } from '@marketplace/components/CategorySelector';

// New way (with legacy export)
import { LegacyCategorySelector } from '@marketplace';

// Preferred new way
import { CategorySelector, CategorySelectionProvider } from '@marketplace';

function NewComponent() {
  return (
    <CategorySelectionProvider>
      <CategorySelector />
    </CategorySelectionProvider>
  );
}
```

### Key Differences

1. **State Management**: Context providers replace complex internal state
2. **Data Fetching**: Clean hooks replace mixed data/UI logic
3. **Validation**: Pure functions replace component-level validation
4. **Composition**: Smaller, focused components replace monolithic ones

## Benefits

### ✅ Improved Maintainability
- Clear separation of concerns
- Single responsibility principle
- Easier to test and debug

### ✅ Better Performance
- Proper React Query caching
- Reduced unnecessary re-renders
- Optimized data fetching

### ✅ Enhanced Developer Experience
- Type-safe interfaces
- Clear documentation
- Predictable behavior

### ✅ Scalability
- Modular architecture
- Reusable components
- Easy to extend

## API Reference

### Data Layer

#### `categoryService`
```tsx
// Fetch root categories
const rootCategories = await categoryService.getRootCategories();

// Get category by slug
const category = await categoryService.getCategoryBySlug('electronics');

// Get attributes for categories
const attributes = await categoryService.getAttributesForCategories(['electronics', 'phones']);
```

#### Data Hooks
```tsx
// React Query hooks
const { data: categories, isLoading } = useRootCategories();
const { data: category } = useCategoryBySlug('electronics');
const { data: attributes } = useCategoryAttributes(['electronics']);
```

### State Management

#### Category Selection Context
```tsx
const { state, dispatch } = useCategorySelection();
const actions = useCategorySelectionActions();

// Actions
actions.setPrimary(category);
actions.setSubcategory(subcategory);
actions.clearSelection();
```

### Utilities

#### Attribute Utils
```tsx
import {
  validateAttributeValue,
  initializeAttributeStates,
  updateAttributeState,
  getAttributeErrors
} from '@marketplace/lib/attribute-utils';

// Validation
const error = validateAttributeValue(value, definition);

// State management
const states = initializeAttributeStates(definitions, initialValues);
const updatedStates = updateAttributeState(states, documentId, newValue);
```

## Examples

See the `/examples` directory for complete working examples:

- `ListingFilterExample.tsx` - Complete filter implementation
- `ListingFormExample.tsx` - Form with category and attribute selection
- `StandaloneUsage.tsx` - Using components individually

## Contributing

When adding new features:

1. **Follow the layer pattern** - put code in the appropriate layer
2. **Write pure functions** when possible
3. **Use TypeScript** for all new code
4. **Add tests** for business logic
5. **Update documentation** for new APIs

## Legacy Support

Legacy components remain available during migration:

- `LegacyCategorySelector` - Original CategorySelector
- `LegacyAttributesManager` - Original AttributesManager

These will be removed in a future version after migration is complete. 

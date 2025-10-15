# Mobile User Experience - Browse Listings

## Overview

The mobile experience has been optimized to ensure users can efficiently browse listings without unnecessary scrolling to access filters. The key principle: **users should only scroll to see more listings, not to access filters**.

## Mobile-Specific Features

### 1. Filter Button (Mobile Only)

**Component:** `MobileFilterButton.tsx`

- Fixed button at the top of the listings grid
- Shows current selection (category or subcategory)
- Clear "Tap to change" indicator
- Full-width for easy thumb access
- Only visible on screens < 1024px (below lg breakpoint)

```tsx
// Usage
<MobileFilterButton
  selectedCategory={selectedCategory}
  selectedSubcategory={selectedSubcategory}
  onClick={() => setShowMobileModal(true)}
/>
```

### 2. Category Selection Modal

**Component:** `MobileCategoryModal.tsx`

- Full-screen modal (85vh height) for category selection
- **Nested display**: Subcategories shown directly under their parent categories
- **Instant selection**: Modal closes immediately when user makes a choice
- Features:
  - Scrollable content area
  - Icons for each main category
  - Visual checkmarks for selected items
  - "All Categories" option to reset
  - Subcategories indented under their parent
  - Can click category OR subcategory directly
  - No Apply button needed - instant feedback

### 3. Filters Modal (Mobile Only)

**Component:** `MobileFiltersModal.tsx`

- Additional filters modal that appears after category selection
- Only shown when a category is selected
- Contains:
  - **Search filter**: Search within selected category
  - **City filter**: Filter by location
  - **Attribute filters**: Dynamic filters based on selected category (e.g., condition, size, brand)
- Features:
  - Full-screen scrollable interface
  - Apply button to confirm selections
  - Clear All Filters button to reset
  - Filters persist across modal sessions

```tsx
// Usage
<MobileCategoryModal
  isOpen={showMobileModal}
  onOpenChange={setShowMobileModal}
  selectedCategory={selectedCategory}
  selectedSubcategory={selectedSubcategory}
  onSelectCategory={handleCategorySelect}
  onSelectSubcategory={handleSubcategorySelect}
/>
```

## User Flow

### Desktop Experience (≥1024px)
```
┌─────────────────────────────────────┐
│  Title                              │
├──────────┬──────────────────────────┤
│ Sidebar  │ [Subcategory Chips]      │
│ (Always  │ Listing Grid             │
│ Visible) │ ┌────┬────┬────┐         │
│          │ │    │    │    │         │
│          │ └────┴────┴────┘         │
└──────────┴──────────────────────────┘
```

### Mobile Experience (<1024px)
```
┌─────────────────────────────────────┐
│  Title                              │
├─────────────────────────────────────┤
│  [Category: "Electronics"]          │
│  "Tap to change"                    │
├─────────────────────────────────────┤
│  [More Filters]                     │
│  "Search, Location & More"          │
├─────────────────────────────────────┤
│  Listing Grid                       │
│  ┌────────────┐                     │
│  │            │                     │
│  └────────────┘                     │
│  ┌────────────┐                     │
│  │            │                     │
│  └────────────┘                     │
│  ┌────────────┐                     │
│  │            │                     │
│  └────────────┘                     │
│  (User scrolls here to see more)    │
└─────────────────────────────────────┘
```

Note: 
- Subcategory chips are hidden on mobile
- "More Filters" button only appears when a category is selected
- Users access all additional filters through the filters modal

### Modal Experience (Mobile)
```
When user taps filter button:

┌─────────────────────────────────────┐
│  ╳  Select Category                 │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ▣ All Categories         ✓ │   │
│  └─────────────────────────────┘   │
│  ────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🚗 Vehicles                  │   │
│  └─────────────────────────────┘   │
│     ┌───────────────────────┐      │
│     │   Cars                │      │
│     └───────────────────────┘      │
│     ┌───────────────────────┐      │
│     │   Motorcycles         │      │
│     └───────────────────────┘      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💻 Electronics            ✓ │   │
│  └─────────────────────────────┘   │
│     ┌───────────────────────┐      │
│     │   Laptops          ✓  │      │
│     └───────────────────────┘      │
│     ┌───────────────────────┐      │
│     │   Phones              │      │
│     └───────────────────────┘      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🛋️ Furniture                 │   │
│  └─────────────────────────────┘   │
│     ┌───────────────────────┐      │
│     │   Living Room         │      │
│     └───────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Note:** Modal closes instantly when user taps any category or subcategory - no Apply button needed!

## Interaction Patterns

### 1. Initial Load (Mobile)
- User lands on page
- Filter button shows "All Categories"
- All listings displayed
- User can immediately scroll to browse

### 2. Category Selection (Mobile)
1. User taps category button
2. Modal opens showing all categories with nested subcategories
3. User can tap:
   - A main category (e.g., "Electronics") to see all items in that category
   - A subcategory (e.g., "Laptops") to filter by that specific subcategory
   - "All Categories" to reset filters
4. **Modal closes instantly** upon selection
5. Listings update immediately
6. "More Filters" button appears below category button

### 3. Additional Filters (Mobile)
1. After selecting a category, "More Filters" button appears
2. User taps "More Filters" button
3. Modal opens with:
   - Search field
   - City dropdown
   - Category-specific attribute filters (condition, brand, size, etc.)
4. User adjusts filters as needed
5. Taps "Apply Filters" to see results
6. Can tap "Clear All Filters" to reset

### 4. No Subcategory Chips on Mobile
- Subcategory chips are **hidden on mobile** (`lg:hidden`)
- Users select subcategories directly from the modal
- Keeps the mobile interface clean and focused on browsing

### 5. Browsing (Mobile)
- User scrolls down to see more listings
- Filter buttons stay at the top (not sticky)
- No interference with scrolling
- Smooth, natural browsing experience

## Design Decisions

### Why Modal Instead of Sidebar?

**Problem with Sidebar on Mobile:**
- Takes up valuable vertical space
- Forces users to scroll past filters to see listings
- Poor use of narrow screens
- Filters compete with content for attention

**Benefits of Modal Approach:**
- Listings immediately visible
- Full screen real estate for browsing
- Filters available when needed, not in the way
- Familiar mobile UX pattern

### Why Button Always Visible?

- Users always know what they're filtering by
- One tap to change filters
- No hunting for filter controls
- Clear call-to-action

### Why Subcategory Chips Outside Modal?

- Quick switching between subcategories
- No need to re-open modal
- Visual reminder of available options
- Desktop-mobile consistency

## Responsive Breakpoints

```css
/* Mobile: < 1024px (lg) */
- Sidebar: Hidden
- Filter Button: Visible
- Modal: Full interaction

/* Desktop: ≥ 1024px (lg) */
- Sidebar: Visible
- Filter Button: Hidden
- Modal: Not used
```

## Accessibility

### Mobile Modal
- Full keyboard navigation support
- Proper ARIA labels
- Focus management (returns to button on close)
- ESC key to close
- Touch-friendly tap targets (48px minimum)

### Filter Button
- Clear label describing current state
- Visual and text feedback
- High contrast for visibility
- Large touch target

## Performance Considerations

### Lazy Loading
- Modal component only renders when opened
- Category data fetched on demand
- No performance impact when browsing

### Smooth Interactions
- CSS animations for modal open/close
- No layout shift when switching views
- Optimized re-renders with React memoization

## Testing Checklist

### Mobile Experience
- [ ] Filter button visible on mobile only
- [ ] Tapping button opens modal
- [ ] Modal is scrollable
- [ ] Category selection works
- [ ] Subcategory selection works
- [ ] Apply button closes modal and updates listings
- [ ] Chips appear after category selection
- [ ] User can scroll listings without interference
- [ ] Modal closes on outside tap
- [ ] Modal closes with back button (Android)

### Responsive Behavior
- [ ] Sidebar hidden below 1024px
- [ ] Sidebar visible above 1024px
- [ ] Filter button hidden above 1024px
- [ ] Layout doesn't break at breakpoint
- [ ] No horizontal scroll at any width

## Future Enhancements

Potential improvements:
1. **Sticky Filter Button**: Keep button visible while scrolling
2. **Filter Count Badge**: Show number of active filters
3. **Quick Filters**: Add popular categories as chips below button
4. **Recent Selections**: Remember last 3 category choices
5. **Swipe Gestures**: Swipe to open/close modal
6. **Bottom Sheet**: Alternative to modal for better thumb reach
7. **Predictive Categories**: Show popular categories based on location
8. **Filter Presets**: "Popular", "New", "Nearby" quick filters

## Implementation Notes

### CSS Classes Used
- `lg:hidden` - Hide on desktop, show on mobile
- `hidden lg:block` - Hide on mobile, show on desktop
- `overflow-y-auto` - Scrollable modal content
- `h-[85vh]` - Modal height (85% of viewport)
- `max-w-md` - Modal max width

### State Management
- `showMobileModal` - Controls modal visibility
- Category/subcategory state shared between modal and main page
- URL parameters preserved across selections

### Key Files
- `MobileCategoryModal.tsx` - Category selection modal
- `MobileFiltersModal.tsx` - Additional filters modal
- `MobileFilterButton.tsx` - Category filter button
- `listings/page.tsx` - Integration and logic
- `ListingsSidebar.tsx` - Desktop sidebar (hidden on mobile)


/**
 * Migration Example
 * Shows how to migrate from old architecture to new clean architecture
 */

"use client";

// ================================
// OLD ARCHITECTURE (BEFORE)
// ================================

/*
// This is how components looked before refactoring
// Complex, mixed concerns, hard to maintain

import { useState, useEffect } from "react";
import { categoryService } from "@repo/cms";

function OldListingSidebar() {
  // Mixed state management
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Complex data fetching logic mixed with component
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.getRootCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // More mixed data fetching
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const category = await categoryService.getCategoryBySlug(selectedCategory.slug);
          setSubcategories(category.categories || []);
          setAttributes(category.attributes || []);
        } catch (error) {
          console.error('Failed to fetch subcategories:', error);
        }
      };
      fetchSubcategories();
    }
  }, [selectedCategory]);

  // Complex event handlers
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setAttributeValues({});
  };

  const handleAttributeChange = (attributeId, value) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  // Complex rendering logic
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          // Inline category selection logic
          // Inline attribute rendering
          // Mixed UI and business logic
        </div>
      )}
    </div>
  );
}
*/

// ================================
// NEW ARCHITECTURE (AFTER)
// ================================

import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useState } from "react";
import {
	AttributeManager,
	type AttributeValue,
	type CategoryNode,
	CategorySelectionProvider,
	CategorySelector,
} from "../index";

// Clean, focused interface
interface NewListingSidebarProps {
	onFiltersChange?: (filters: {
		category: CategoryNode | null;
		subcategory: CategoryNode | null;
		attributes: Record<string, AttributeValue>;
	}) => void;
	onClearFilters?: () => void;
}

function NewListingSidebar({
	onFiltersChange,
	onClearFilters,
}: NewListingSidebarProps) {
	// Simple, focused state
	const [filters, setFilters] = useState<{
		category: CategoryNode | null;
		subcategory: CategoryNode | null;
		attributes: Record<string, AttributeValue>;
	}>({
		category: null,
		subcategory: null,
		attributes: {},
	});

	// Clean, focused event handlers
	const handleCategoryChange = (
		primary: CategoryNode | null,
		subcategory: CategoryNode | null,
	) => {
		const newFilters = {
			category: primary,
			subcategory,
			attributes: {}, // Clear attributes when category changes
		};

		setFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	const handleAttributeChange = (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => {
		const newFilters = {
			...filters,
			attributes: {
				...filters.attributes,
				[attributeDocumentId]: value,
			},
		};

		setFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	const handleClearAll = () => {
		const clearedFilters = {
			category: null,
			subcategory: null,
			attributes: {},
		};

		setFilters(clearedFilters);
		onFiltersChange?.(clearedFilters);
		onClearFilters?.();
	};

	// Clean, declarative rendering
	return (
		<CategorySelectionProvider>
			<Card className="p-6">
				<div className="space-y-6">
					<h3 className="font-semibold">Filters</h3>

					{/* Category selection - clean, reusable component */}
					<CategorySelector
						label="Category"
						allowSelectAll={true}
						onSelectionChange={handleCategoryChange}
					/>

					{/* Attribute management - clean, reusable component */}
					<AttributeManager
						isFilter={true}
						onChange={handleAttributeChange}
						initialValues={filters.attributes}
					/>

					{/* Simple action */}
					<Button
						variant="outline"
						className="w-full"
						onClick={handleClearAll}
					>
						Clear Filters
					</Button>
				</div>
			</Card>
		</CategorySelectionProvider>
	);
}

// ================================
// MIGRATION BENEFITS COMPARISON
// ================================

export function MigrationComparison() {
	return (
		<div className="grid grid-cols-2 gap-8 p-8">
			{/* Before Column */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold text-destructive">
					❌ Before (Problems)
				</h2>
				<div className="space-y-2 text-sm">
					<p>• Mixed data fetching and UI logic</p>
					<p>• Complex state management</p>
					<p>• Hard to test individual parts</p>
					<p>• Code duplication across components</p>
					<p>• Tight coupling to API structure</p>
					<p>• No proper error handling</p>
					<p>• Poor performance (unnecessary re-renders)</p>
					<p>• Difficult to reuse logic</p>
				</div>
			</div>

			{/* After Column */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold text-green-600">
					✅ After (Benefits)
				</h2>
				<div className="space-y-2 text-sm">
					<p>• Clear separation of concerns</p>
					<p>• Simple, focused components</p>
					<p>• Easy to test each layer</p>
					<p>• Reusable components and logic</p>
					<p>• Abstracted from API details</p>
					<p>• Built-in error handling</p>
					<p>• Optimized with React Query</p>
					<p>• Composable and extensible</p>
				</div>
			</div>
		</div>
	);
}

// ================================
// STEP-BY-STEP MIGRATION GUIDE
// ================================

/*
MIGRATION STEPS:

1. IDENTIFY CONCERNS
   - Data fetching → Move to data layer
   - State management → Move to context
   - Business logic → Move to utils
   - UI rendering → Keep in component

2. EXTRACT DATA LAYER
   - Create service class for API calls
   - Create React Query hooks
   - Replace useEffect with hooks

3. EXTRACT STATE MANAGEMENT
   - Create context for shared state
   - Use reducers for complex state
   - Replace useState with context

4. EXTRACT BUSINESS LOGIC
   - Create pure functions for validation
   - Create utilities for data transformation
   - Move calculations to utils

5. REFACTOR COMPONENTS
   - Use new data hooks
   - Connect to context providers
   - Focus on rendering only

6. TEST AND VALIDATE
   - Test each layer independently
   - Ensure backward compatibility
   - Verify performance improvements

MIGRATION CHECKLIST:
□ Data fetching moved to hooks
□ State management in context
□ Business logic in pure functions  
□ Components only handle UI
□ Proper TypeScript types
□ Error handling implemented
□ Performance optimized
□ Tests written for new code
*/

export default NewListingSidebar;

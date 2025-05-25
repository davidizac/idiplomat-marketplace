/**
 * Category Selection Context
 * Manages category selection state across components
 */

"use client";

import { type ReactNode, createContext, useContext, useReducer } from "react";
import type { CategoryNode } from "../data/category-service";

// State interfaces
export interface CategorySelection {
	primary: CategoryNode | null;
	subcategory: CategoryNode | null;
	path: CategoryNode[];
}

export interface CategorySelectionState {
	selection: CategorySelection;
	isLoading: boolean;
	error: string | null;
}

// Action types
type CategoryAction =
	| { type: "SET_PRIMARY"; payload: CategoryNode | null }
	| { type: "SET_SUBCATEGORY"; payload: CategoryNode | null }
	| { type: "SET_PATH"; payload: CategoryNode[] }
	| { type: "CLEAR_SELECTION" }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null };

// Initial state
const initialState: CategorySelectionState = {
	selection: {
		primary: null,
		subcategory: null,
		path: [],
	},
	isLoading: false,
	error: null,
};

// Reducer
function categorySelectionReducer(
	state: CategorySelectionState,
	action: CategoryAction,
): CategorySelectionState {
	switch (action.type) {
		case "SET_PRIMARY":
			return {
				...state,
				selection: {
					primary: action.payload,
					subcategory: null, // Clear subcategory when primary changes
					path: action.payload ? [action.payload] : [],
				},
				error: null,
			};

		case "SET_SUBCATEGORY":
			return {
				...state,
				selection: {
					...state.selection,
					subcategory: action.payload,
					path:
						action.payload && state.selection.primary
							? [state.selection.primary, action.payload]
							: state.selection.path,
				},
				error: null,
			};

		case "SET_PATH":
			return {
				...state,
				selection: {
					primary: action.payload[0] || null,
					subcategory: action.payload[1] || null,
					path: action.payload,
				},
				error: null,
			};

		case "CLEAR_SELECTION":
			return {
				...state,
				selection: {
					primary: null,
					subcategory: null,
					path: [],
				},
				error: null,
			};

		case "SET_LOADING":
			return {
				...state,
				isLoading: action.payload,
			};

		case "SET_ERROR":
			return {
				...state,
				error: action.payload,
				isLoading: false,
			};

		default:
			return state;
	}
}

// Context
const CategorySelectionContext = createContext<{
	state: CategorySelectionState;
	dispatch: React.Dispatch<CategoryAction>;
} | null>(null);

// Provider component
export function CategorySelectionProvider({
	children,
}: { children: ReactNode }) {
	const [state, dispatch] = useReducer(
		categorySelectionReducer,
		initialState,
	);

	return (
		<CategorySelectionContext.Provider value={{ state, dispatch }}>
			{children}
		</CategorySelectionContext.Provider>
	);
}

// Hook to use the context
export function useCategorySelection() {
	const context = useContext(CategorySelectionContext);
	if (!context) {
		throw new Error(
			"useCategorySelection must be used within a CategorySelectionProvider",
		);
	}
	return context;
}

// Convenience hooks
export function useCategorySelectionState() {
	const { state } = useCategorySelection();
	return state;
}

export function useCategorySelectionActions() {
	const { dispatch } = useCategorySelection();

	return {
		setPrimary: (category: CategoryNode | null) =>
			dispatch({ type: "SET_PRIMARY", payload: category }),

		setSubcategory: (category: CategoryNode | null) =>
			dispatch({ type: "SET_SUBCATEGORY", payload: category }),

		setPath: (path: CategoryNode[]) =>
			dispatch({ type: "SET_PATH", payload: path }),

		clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),

		setLoading: (loading: boolean) =>
			dispatch({ type: "SET_LOADING", payload: loading }),

		setError: (error: string | null) =>
			dispatch({ type: "SET_ERROR", payload: error }),
	};
}

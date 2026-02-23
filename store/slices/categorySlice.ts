import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryTableType } from '@/schemas/admin/product/taxonomySchemas';

interface CategoryState {
    allCategories: {
        data: CategoryTableType[];
        fetched: boolean;
    };
}

const initialState: CategoryState = {
    allCategories: {
        data: [],
        fetched: false,
    },
};

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        setCategoriesList: (state, action: PayloadAction<{
            data: CategoryTableType[];
            fetchedStatus: boolean;
        }>) => {
            state.allCategories.data = action.payload.data;
            state.allCategories.fetched = action.payload.fetchedStatus;
        },
        
        addACategory: (state, action: PayloadAction<CategoryTableType>) => {
            const newCategory = action.payload;
            
            // Shift existing categories with sortorder >= newCategory.sortorder
            state.allCategories.data.forEach(category => {
                if (category.sortorder >= newCategory.sortorder) {
                    category.sortorder++;
                }
            });
            
            // Add the new category
            state.allCategories.data.push(newCategory);
            
            // Ensure all categories are properly ordered from 1 without gaps
            const sortedCategories = [...state.allCategories.data].sort((a, b) => a.sortorder - b.sortorder);
            sortedCategories.forEach((category, index) => {
                if (category.sortorder !== (index + 1)) {
                    category.sortorder = index + 1;
                }
            });
            
            // reorder the categories in the state
            state.allCategories.data = sortedCategories;
        },
        
        updateACategory: (state, action: PayloadAction<CategoryTableType>) => {
            const updatedCategory = action.payload;
            const index = state.allCategories.data.findIndex(
                category => category.id === updatedCategory.id
            );
            
            if (index !== -1) {
                const oldCategory = state.allCategories.data[index];
                const oldSortorder = oldCategory.sortorder;
                const newSortorder = updatedCategory.sortorder;

                // First update the category fields (except sortorder initially)
                state.allCategories.data[index] = {
                    ...updatedCategory,
                    sortorder: oldSortorder,
                };

                // Handle sortorder changes
                if (oldSortorder !== newSortorder) {
                    if (newSortorder > oldSortorder) {
                        // Moving to a higher position: shift categories down between old and new position
                        state.allCategories.data.forEach(category => {
                            if (category.id !== updatedCategory.id && 
                                category.sortorder > oldSortorder && 
                                category.sortorder <= newSortorder) {
                                category.sortorder--;
                            }
                        });
                    } else {
                        // Moving to a lower position: shift categories up between new and old position
                        state.allCategories.data.forEach(category => {
                            if (category.id !== updatedCategory.id && 
                                category.sortorder >= newSortorder && 
                                category.sortorder < oldSortorder) {
                                category.sortorder++;
                            }
                        });
                    }

                    // update the current category's sortorder
                    state.allCategories.data[index].sortorder = newSortorder;

                    // Ensure all categories are properly ordered from 1 without gaps
                    const sortedCategories = [...state.allCategories.data].sort((a, b) => a.sortorder - b.sortorder);
                    sortedCategories.forEach((category, index) => {
                        if (category.sortorder !== (index + 1)) {
                            category.sortorder = index + 1;
                        }
                    });

                    // reorder the categories in the state
                    state.allCategories.data = sortedCategories;
                }
            }
        },
        
        removeACategory: (state, action: PayloadAction<{ categoryId: string }>) => {
            const categoryToRemove = state.allCategories.data.find(
                category => category.id === action.payload.categoryId
            );
            
            if (categoryToRemove) {
                // Remove the category
                state.allCategories.data = state.allCategories.data.filter(
                    category => category.id !== action.payload.categoryId
                );
                
                // Shift down all categories with higher sortorder
                state.allCategories.data.forEach(category => {
                    if (category.sortorder > categoryToRemove.sortorder) {
                        category.sortorder--;
                    }
                });
                
                // Ensure all categories are properly ordered from 1 without gaps
                const sortedCategories = [...state.allCategories.data].sort((a, b) => a.sortorder - b.sortorder);
                sortedCategories.forEach((category, index) => {
                    if (category.sortorder !== (index + 1)) {
                        category.sortorder = index + 1;
                    }
                });
                
                // reorder the categories in the state
                state.allCategories.data = sortedCategories;
            }
        },
        
        clearCategoriesData: (state) => {
            state.allCategories.data = [];
            state.allCategories.fetched = false;
        },
    },
});

export const {
    setCategoriesList,
    addACategory,
    updateACategory,
    removeACategory,
    clearCategoriesData,
} = categorySlice.actions;

export default categorySlice.reducer;

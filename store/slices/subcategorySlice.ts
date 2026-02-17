import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubcategoryTableType } from '@/schemas/admin/product/taxonomySchemas';

interface SubcategoryState {
    allSubcategories: {
        data: SubcategoryTableType[];
        fetched: boolean;
    };
}

const initialState: SubcategoryState = {
    allSubcategories: {
        data: [],
        fetched: false,
    },
};

const subcategorySlice = createSlice({
    name: 'subcategories',
    initialState,
    reducers: {
        setSubcategoriesList: (state, action: PayloadAction<{
            data: SubcategoryTableType[];
            fetchedStatus: boolean;
        }>) => {
            state.allSubcategories.data = action.payload.data;
            state.allSubcategories.fetched = action.payload.fetchedStatus;
        },
        
        addASubcategory: (state, action: PayloadAction<SubcategoryTableType>) => {
            const newSubcategory = action.payload;
            
            // Shift existing subcategories with sortorder >= newSubcategory.sortorder within the same category
            state.allSubcategories.data.forEach(subcategory => {
                if (subcategory.category.id === newSubcategory.category.id && 
                    subcategory.sortorder >= newSubcategory.sortorder) {
                    subcategory.sortorder++;
                }
            });
            
            // Add the new subcategory
            state.allSubcategories.data.push(newSubcategory);
            
            // Ensure all subcategories within this category are properly ordered from 1 without gaps
            const subcategoriesInCategory = state.allSubcategories.data
                .filter(sub => sub.category.id === newSubcategory.category.id)
                .sort((a, b) => a.sortorder - b.sortorder);
            
            subcategoriesInCategory.forEach((subcategory, index) => {
                if (subcategory.sortorder !== (index + 1)) {
                    subcategory.sortorder = index + 1;
                }
            });
        },
        
        updateASubcategory: (state, action: PayloadAction<SubcategoryTableType>) => {
            const updatedSubcategory = action.payload;
            const index = state.allSubcategories.data.findIndex(
                subcategory => subcategory.id === updatedSubcategory.id
            );
            
            if (index !== -1) {
                const oldSubcategory = state.allSubcategories.data[index];
                const oldSortorder = oldSubcategory.sortorder;
                const oldCategoryId = oldSubcategory.category.id;
                const newSortorder = updatedSubcategory.sortorder;
                const newCategoryId = updatedSubcategory.category.id;

                // Update the subcategory fields first
                state.allSubcategories.data[index] = updatedSubcategory;

                // Handle sortorder changes within the same category or when moving to a different category
                if (oldCategoryId !== newCategoryId) {
                    // Moving to a different category
                    
                    // Shift down subcategories in the old category
                    state.allSubcategories.data.forEach(subcategory => {
                        if (subcategory.category.id === oldCategoryId && 
                            subcategory.id !== updatedSubcategory.id &&
                            subcategory.sortorder > oldSortorder) {
                            subcategory.sortorder--;
                        }
                    });

                    // Ensure proper ordering in old category
                    const oldCategorySubcategories = state.allSubcategories.data
                        .filter(sub => sub.category.id === oldCategoryId)
                        .sort((a, b) => a.sortorder - b.sortorder);
                    
                    oldCategorySubcategories.forEach((subcategory, index) => {
                        if (subcategory.sortorder !== (index + 1)) {
                            subcategory.sortorder = index + 1;
                        }
                    });

                    // Shift up subcategories in the new category
                    state.allSubcategories.data.forEach(subcategory => {
                        if (subcategory.category.id === newCategoryId && 
                            subcategory.id !== updatedSubcategory.id &&
                            subcategory.sortorder >= newSortorder) {
                            subcategory.sortorder++;
                        }
                    });

                    // Ensure proper ordering in new category
                    const newCategorySubcategories = state.allSubcategories.data
                        .filter(sub => sub.category.id === newCategoryId)
                        .sort((a, b) => a.sortorder - b.sortorder);
                    
                    newCategorySubcategories.forEach((subcategory, index) => {
                        if (subcategory.sortorder !== (index + 1)) {
                            subcategory.sortorder = index + 1;
                        }
                    });
                    
                } else if (oldSortorder !== newSortorder) {
                    // Staying in the same category but changing sortorder
                    
                    if (newSortorder > oldSortorder) {
                        // Moving to a higher position: shift subcategories down between old and new position
                        state.allSubcategories.data.forEach(subcategory => {
                            if (subcategory.category.id === newCategoryId && 
                                subcategory.id !== updatedSubcategory.id && 
                                subcategory.sortorder > oldSortorder && 
                                subcategory.sortorder <= newSortorder) {
                                subcategory.sortorder--;
                            }
                        });
                    } else {
                        // Moving to a lower position: shift subcategories up between new and old position
                        state.allSubcategories.data.forEach(subcategory => {
                            if (subcategory.category.id === newCategoryId && 
                                subcategory.id !== updatedSubcategory.id && 
                                subcategory.sortorder >= newSortorder && 
                                subcategory.sortorder < oldSortorder) {
                                subcategory.sortorder++;
                            }
                        });
                    }

                    // Ensure all subcategories within this category are properly ordered from 1 without gaps
                    const subcategoriesInCategory = state.allSubcategories.data
                        .filter(sub => sub.category.id === newCategoryId)
                        .sort((a, b) => a.sortorder - b.sortorder);
                    
                    subcategoriesInCategory.forEach((subcategory, index) => {
                        if (subcategory.sortorder !== (index + 1)) {
                            subcategory.sortorder = index + 1;
                        }
                    });
                }
            }
        },
        
        removeASubcategory: (state, action: PayloadAction<{ subcategoryId: string }>) => {
            const subcategoryToRemove = state.allSubcategories.data.find(
                subcategory => subcategory.id === action.payload.subcategoryId
            );
            
            if (subcategoryToRemove) {
                const categoryId = subcategoryToRemove.category.id;
                const deletedSortorder = subcategoryToRemove.sortorder;
                
                // Remove the subcategory
                state.allSubcategories.data = state.allSubcategories.data.filter(
                    subcategory => subcategory.id !== action.payload.subcategoryId
                );
                
                // Shift down all subcategories with higher sortorder within the same category
                state.allSubcategories.data.forEach(subcategory => {
                    if (subcategory.category.id === categoryId && 
                        subcategory.sortorder > deletedSortorder) {
                        subcategory.sortorder--;
                    }
                });
                
                // Ensure all subcategories within this category are properly ordered from 1 without gaps
                const subcategoriesInCategory = state.allSubcategories.data
                    .filter(sub => sub.category.id === categoryId)
                    .sort((a, b) => a.sortorder - b.sortorder);
                
                subcategoriesInCategory.forEach((subcategory, index) => {
                    if (subcategory.sortorder !== (index + 1)) {
                        subcategory.sortorder = index + 1;
                    }
                });
            }
        },
        
        clearSubcategoriesData: (state) => {
            state.allSubcategories.data = [];
            state.allSubcategories.fetched = false;
        },
    },
});

export const {
    setSubcategoriesList,
    addASubcategory,
    updateASubcategory,
    removeASubcategory,
    clearSubcategoriesData,
} = subcategorySlice.actions;

export default subcategorySlice.reducer;

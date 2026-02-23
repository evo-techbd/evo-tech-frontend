import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";

interface FeaturedSectionState {
    allSections: {
        data: FeaturedSectionDisplayType[];
        fetched: boolean;
    };
}

const initialState: FeaturedSectionState = {
    allSections: {
        data: [],
        fetched: false,
    }
};

const featuredSectionSlice = createSlice({
    name: "featuredSections",
    initialState,
    reducers: {
        setFeaturedSectionsList: (state, action: PayloadAction<{ data: FeaturedSectionDisplayType[]; fetchedStatus: boolean; }>) => {
            state.allSections.data = action.payload.data;
            state.allSections.fetched = action.payload.fetchedStatus;
        },

        addAFeaturedSection: (state, action: PayloadAction<FeaturedSectionDisplayType>) => {
            const newSection = action.payload;
            
            // Shift existing sections with sortorder >= newSection.sortorder
            state.allSections.data.forEach(section => {
                if (section.sortorder >= newSection.sortorder) {
                    section.sortorder++;
                }
            });
            
            // Add the new section
            state.allSections.data.push(newSection);
            
            // Ensure all sections are properly ordered from 1 without gaps
            const sortedSections = [...state.allSections.data].sort((a, b) => a.sortorder - b.sortorder);
            sortedSections.forEach((section, index) => {
                if (section.sortorder !== (index + 1)) {
                    section.sortorder = index + 1;
                }
            });
            
            // reorder the sections in the state
            state.allSections.data = sortedSections;
        },

        updateAFeaturedSection: (state, action: PayloadAction<FeaturedSectionDisplayType>) => {
            const updatedSection = action.payload;
            const index = state.allSections.data.findIndex(
                section => section.sectionid === updatedSection.sectionid
            );
            
            if (index !== -1) {
                const oldSection = state.allSections.data[index];
                const oldSortorder = oldSection.sortorder;
                const newSortorder = updatedSection.sortorder;

                // First update the section fields (except sortorder initially)
                state.allSections.data[index] = {
                    ...updatedSection,
                    sortorder: oldSortorder,
                };

                // Handle sortorder changes
                if (oldSortorder !== newSortorder) {
                    if (newSortorder > oldSortorder) {
                        // Moving to a higher position: shift sections down between old and new position
                        state.allSections.data.forEach(section => {
                            if (section.sectionid !== updatedSection.sectionid && 
                                section.sortorder > oldSortorder && 
                                section.sortorder <= newSortorder) {
                                section.sortorder--;
                            }
                        });
                    } else {
                        // Moving to a lower position: shift sections up between new and old position
                        state.allSections.data.forEach(section => {
                            if (section.sectionid !== updatedSection.sectionid && 
                                section.sortorder >= newSortorder && 
                                section.sortorder < oldSortorder) {
                                section.sortorder++;
                            }
                        });
                    }

                    // update the current section's sortorder
                    state.allSections.data[index].sortorder = newSortorder;

                    // Ensure all sections are properly ordered from 1 without gaps
                    const sortedSections = [...state.allSections.data].sort((a, b) => a.sortorder - b.sortorder);
                    sortedSections.forEach((section, index) => {
                        if (section.sortorder !== (index + 1)) {
                            section.sortorder = index + 1;
                        }
                    });

                    // reorder the sections in the state
                    state.allSections.data = sortedSections;
                }
            }
        },

        removeAFeaturedSection: (state, action: PayloadAction<{ sectionId: string; }>) => {
            const sectionToRemove = state.allSections.data.find(
                section => section.sectionid === action.payload.sectionId
            );
            
            if (sectionToRemove) {
                // Remove the section
                state.allSections.data = state.allSections.data.filter(
                    section => section.sectionid !== action.payload.sectionId
                );
                
                // Shift down all sections with higher sortorder
                state.allSections.data.forEach(section => {
                    if (section.sortorder > sectionToRemove.sortorder) {
                        section.sortorder--;
                    }
                });
                
                // Ensure all sections are properly ordered from 1 without gaps
                const sortedSections = [...state.allSections.data].sort((a, b) => a.sortorder - b.sortorder);
                sortedSections.forEach((section, index) => {
                    if (section.sortorder !== (index + 1)) {
                        section.sortorder = index + 1;
                    }
                });
                
                // reorder the sections in the state
                state.allSections.data = sortedSections;
            }
        },

        clearFeaturedSectionsData: (state) => {
            state.allSections.data = [];
            state.allSections.fetched = false;
        },
    },
});

export const {
    setFeaturedSectionsList,
    addAFeaturedSection,
    updateAFeaturedSection,
    removeAFeaturedSection,
    clearFeaturedSectionsData,
} = featuredSectionSlice.actions;

export default featuredSectionSlice.reducer;

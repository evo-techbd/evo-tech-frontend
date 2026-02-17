'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";

/**
 * Custom hook for accessing featured sections data from Redux store
 * Provides sections data, loading state, and utility functions
 */
export const useFeaturedSections = () => {
    const sections = useSelector((state: RootState) => state.featuredSections.allSections.data);
    const isFetched = useSelector((state: RootState) => state.featuredSections.allSections.fetched);

    // Utility functions for easy data access
    const getSectionById = (sectionId: string): FeaturedSectionDisplayType | undefined => {
        return sections.find(section => section.sectionid === sectionId);
    };

    const getSectionByTitle = (title: string): FeaturedSectionDisplayType | undefined => {
        return sections.find(section => section.title.toLowerCase() === title.toLowerCase());
    };

    const getSectionsBySortOrder = (): FeaturedSectionDisplayType[] => {
        return [...sections].sort((a, b) => a.sortorder - b.sortorder);
    };

    const getSectionsForSelect = () => {
        return getSectionsBySortOrder().map(section => ({
            value: section.sectionid,
            label: section.title,
            sortorder: section.sortorder,
            items_count: section.items_count
        }));
    };

    const getSectionsForSelectWithDetails = () => {
        return getSectionsBySortOrder().map(section => ({
            value: section.sectionid,
            label: `${section.title} (${section.items_count} items)`,
            title: section.title,
            sortorder: section.sortorder,
            items_count: section.items_count,
            view_more_url: section.view_more_url
        }));
    };

    const getAvailableSortOrders = (): number[] => {
        const usedOrders = sections.map(section => section.sortorder);
        const maxOrder = Math.max(...usedOrders, 0);
        const availableOrders: number[] = [];
        
        for (let i = 1; i <= maxOrder + 1; i++) {
            if (!usedOrders.includes(i)) {
                availableOrders.push(i);
            }
        }
        
        return availableOrders;
    };

    const getNextAvailableSortOrder = (): number => {
        const availableOrders = getAvailableSortOrders();
        return availableOrders.length > 0 ? Math.min(...availableOrders) : sections.length + 1;
    };

    const getSectionsByItemCount = (ascending: boolean = false): FeaturedSectionDisplayType[] => {
        return [...sections].sort((a, b) => 
            ascending ? a.items_count - b.items_count : b.items_count - a.items_count
        );
    };

    return {
        // Raw data
        sections,
        isFetched,
        isInitialized: isFetched,
        
        // Utility functions
        getSectionById,
        getSectionByTitle,
        getSectionsBySortOrder,
        getSectionsForSelect,
        getSectionsForSelectWithDetails,
        getAvailableSortOrders,
        getNextAvailableSortOrder,
        getSectionsByItemCount,
        
        // Computed values
        hasSections: sections.length > 0,
        totalSections: sections.length,
        totalItems: sections.reduce((total, section) => total + section.items_count, 0),
        averageItemsPerSection: sections.length > 0 ? 
            Math.round(sections.reduce((total, section) => total + section.items_count, 0) / sections.length) : 0,
        maxSortOrder: sections.length > 0 ? Math.max(...sections.map(s => s.sortorder)) : 0,
        
        // Status checks
        isEmpty: sections.length === 0,
        isLoaded: isFetched,
    };
};

/**
 * Hook specifically for accessing a single featured section by ID
 */
export const useFeaturedSection = (sectionId: string) => {
    const sections = useSelector((state: RootState) => state.featuredSections.allSections.data);
    const section = sections.find(s => s.sectionid === sectionId);
    
    return {
        section,
        exists: !!section,
        isFirst: section ? section.sortorder === 1 : false,
        isLast: section ? section.sortorder === Math.max(...sections.map(s => s.sortorder)) : false,
    };
};

/**
 * Hook for getting sections with optional filtering
 */
export const useFeaturedSectionsFilter = (options?: {
    minItems?: number;
    maxItems?: number;
    sortBy?: 'title' | 'sortorder' | 'items_count';
    sortDirection?: 'asc' | 'desc';
}) => {
    const { sections } = useFeaturedSections();
    
    let filteredSections = [...sections];
    
    // Apply filters
    if (options?.minItems !== undefined) {
        filteredSections = filteredSections.filter(section => section.items_count >= options.minItems!);
    }
    
    if (options?.maxItems !== undefined) {
        filteredSections = filteredSections.filter(section => section.items_count <= options.maxItems!);
    }
    
    // Apply sorting
    if (options?.sortBy) {
        filteredSections.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;
            
            switch (options.sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'sortorder':
                    aValue = a.sortorder;
                    bValue = b.sortorder;
                    break;
                case 'items_count':
                    aValue = a.items_count;
                    bValue = b.items_count;
                    break;
                default:
                    return 0;
            }
            
            if (options.sortDirection === 'desc') {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            } else {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
        });
    }
    
    return {
        sections: filteredSections,
        count: filteredSections.length,
        getSectionsForSelect: () => filteredSections.map(section => ({
            value: section.sectionid,
            label: section.title,
            sortorder: section.sortorder,
            items_count: section.items_count
        }))
    };
};

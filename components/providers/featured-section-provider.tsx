'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setFeaturedSectionsList
} from '@/store/slices/featuredSectionSlice';
import type { AppDispatch, RootState } from '@/store/store';
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";

interface FeaturedSectionProviderProps {
    children: React.ReactNode;
    initialData?: FeaturedSectionDisplayType[];
}

export function FeaturedSectionProvider({ children, initialData }: FeaturedSectionProviderProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isInitialized = useSelector((state: RootState) => state.featuredSections.allSections.fetched);

    useEffect(() => {
        // Only initialize if we have server data and the store is not already initialized
        if (initialData && initialData.length > 0 && !isInitialized) {
            try {
                // Validate the data structure before setting it
                const isValidData = initialData.every(section => 
                    section.sectionid && 
                    section.title && 
                    section.view_more_url !== undefined && // not undefined but nullable
                    typeof section.sortorder === 'number' &&
                    section.sortorder > 0 &&
                    typeof section.items_count === 'number'
                );

                if (isValidData) {
                    dispatch(setFeaturedSectionsList({
                        data: initialData,
                        fetchedStatus: true,
                    }));
                } else {
                    // Still mark as fetched to prevent infinite attempts
                    dispatch(setFeaturedSectionsList({
                        data: [],
                        fetchedStatus: true,
                    }));
                }
            } catch (error) {
                // Still mark as fetched to prevent infinite attempts
                dispatch(setFeaturedSectionsList({
                    data: [],
                    fetchedStatus: true,
                }));
            }
        }
        // If initialData is empty array or null, mark as fetched with empty data
        else if (initialData !== undefined && initialData.length === 0 && !isInitialized) {
            dispatch(setFeaturedSectionsList({
                data: [],
                fetchedStatus: true,
            }));
        }
    }, [initialData, isInitialized, dispatch]);

    return <>{children}</>;
}

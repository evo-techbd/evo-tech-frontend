'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setTaxonomyData, 
    setError, 
    selectTaxonomyInitialized,
    selectTaxonomyCategories,
    type TaxonomyCategory 
} from '@/store/slices/taxonomySlice';
import type { AppDispatch, RootState } from '@/store/store';

interface TaxonomyProviderProps {
    children: React.ReactNode;
    initialData?: TaxonomyCategory[];
}

export function TaxonomyProvider({ children, initialData }: TaxonomyProviderProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isInitialized = useSelector((state: RootState) => selectTaxonomyInitialized(state));
    const categories = useSelector((state: RootState) => selectTaxonomyCategories(state));

    useEffect(() => {
        // Only initialize if we have server data and the store is not already initialized
        if (initialData && initialData.length > 0 && !isInitialized) {
            try {
                // Validate the data structure before setting it
                const isValidData = initialData.every(category => 
                    category.id && 
                    category.name && 
                    category.slug && 
                    typeof category.has_subcategories === 'boolean' &&
                    Array.isArray(category.subcategories) &&
                    Array.isArray(category.direct_brands)
                );

                if (isValidData) {
                    dispatch(setTaxonomyData(initialData));
                } else {
                    dispatch(setError('Invalid taxonomy data structure received'));
                }
            } catch (error) {
                dispatch(setError('Failed to initialize taxonomy data'));
            }
        }
    }, [initialData, isInitialized, dispatch]);

    return <>{children}</>;
}

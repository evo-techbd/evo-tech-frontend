"use client";

import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { AppDispatch, RootState } from '@/store/store';
import { updateProductPublishedState } from '@/store/slices/productSlice';
import { toggleItemPublished } from '@/actions/admin/products';
import { toast } from "sonner";

type PublishSwitchProps = {
    productId: string;
    initialValue: boolean;
};

const ProductPublishedSwitch = ({ productId, initialValue }: PublishSwitchProps) => {
    const publishedState = useSelector((state: RootState) =>
        state.products.publishedStates[productId] ?? initialValue
    );
    const dispatch = useDispatch<AppDispatch>();


    const handlePublishToggle = async (newValue: boolean) => {
        const previousState = publishedState;

        // Optimistic update
        dispatch(updateProductPublishedState({ productId, published: newValue }));

        try {
            const result = await toggleItemPublished(productId); // server action

            if (result.success) {
                // Update with the actual server response
                dispatch(updateProductPublishedState({
                    productId,
                    published: result.published!,
                }));
                toast.success('Published status updated successfully');
            } else {
                // Revert on failure
                dispatch(updateProductPublishedState({
                    productId,
                    published: previousState,
                }));
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            // Revert on unexpected error
            dispatch(updateProductPublishedState({
                productId,
                published: previousState,
            }));
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Switch
            checked={publishedState}
            onCheckedChange={handlePublishToggle}
        />
    );
};

export default ProductPublishedSwitch;

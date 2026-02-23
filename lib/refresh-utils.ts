/**
 * Utility functions for refreshing data after mutations
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Refresh the current page to update server components
 * This should be called after successful mutations (create, update, delete)
 * to ensure all server components reflect the latest data
 */
export const refreshPage = (router: AppRouterInstance) => {
  router.refresh();
};

/**
 * Refresh and redirect to a new page
 */
export const refreshAndRedirect = (router: AppRouterInstance, path: string) => {
  router.push(path);
  router.refresh();
};

/**
 * Callback wrapper that adds router.refresh() after the original callback
 */
export const withRefresh = (
  callback: (() => void) | undefined,
  router: AppRouterInstance
) => {
  return () => {
    callback?.();
    router.refresh();
  };
};

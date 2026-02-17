"use client";

import { useRouter } from "next/navigation";
import { NextUIProvider, NextUIProviderProps } from "@nextui-org/react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "@/components/error/errboundaryfallback";
import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";

const Providers = ({ children }: NextUIProviderProps) => {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ReactErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
            {children}
          </ReactErrorBoundary>
        </PersistGate>
      </ReduxProvider>
    </NextUIProvider>
  );
};

export { Providers };

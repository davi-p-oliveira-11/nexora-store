import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import * as Sentry from "@sentry/react";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ClerkProvider } from '@clerk/react'
import { BrowserRouter } from 'react-router';
import { SentryErrorFallback } from './components/SentryErrorFallback.tsx';
import { SentryUserSync } from './components/SentryUserSync.tsx';

const queryClient = new QueryClient();

const apiBase = import.meta.env.VITE_API_URL ?? "";
const tracePropagationTargets =
  apiBase.length > 0 ? [apiBase] : typeof window !== "undefined" ? [window.location.origin] : [];

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
   tracePropagationTargets: tracePropagationTargets,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
       <SentryUserSync />
       <QueryClientProvider client={queryClient}>
         <BrowserRouter>
           <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
              <App />
           </Sentry.ErrorBoundary>
         </BrowserRouter>
       </QueryClientProvider> 
     </ClerkProvider> 
  </StrictMode>,
)

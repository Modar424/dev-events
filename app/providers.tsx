// app/providers.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

// تأكد من وجود export
export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // تحقق من وجود المفتاح
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    console.log('🔍 PostHog Key:', apiKey);
    console.log('🔍 PostHog Host:', apiHost);
    
    if (!apiKey || !apiHost) {
      console.error('❌ PostHog: المفتاح أو المضيف ناقص!');
      return;
    }
    
    posthog.init(apiKey, {
      api_host: apiHost,
    });
    
    console.log('✅ PostHog initialized');
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}
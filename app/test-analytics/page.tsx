// app/test-analytics/page.tsx
'use client';

import posthog from 'posthog-js';

export default function TestAnalytics() {
  const trackEvent = () => {
    // أضف تحقق من وجود posthog
    if (typeof posthog !== 'undefined' && posthog.capture) {
      posthog.capture('test_button_clicked', {
        page: 'test',
        time: new Date().toISOString()
      });
      alert('✅ تم تسجيل الحدث!');
    } else {
      alert('❌ PostHog غير متاح');
      console.error('posthog is not defined');
    }
  };

  const identifyUser = () => {
    if (typeof posthog !== 'undefined' && posthog.identify) {
      posthog.identify('user_123', {
        email: 'test@example.com',
        name: 'مستخدم تجريبي'
      });
      alert('✅ تم تعريف المستخدم!');
    } else {
      alert('❌ PostHog غير متاح');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔧 تجربة PostHog</h1>
      
      <div className="space-y-4">
        <button
          onClick={trackEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          تسجيل حدث
        </button>
        
        <button
          onClick={identifyUser}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          تعريف مستخدم
        </button>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            افتح PostHog Dashboard وشوف الأحداث
          </p>
        </div>
      </div>
    </div>
  );
}
# 🎉 Dev-Events - منصة إدارة الأحداث للمطورين

منصة ويب حديثة لاكتشاف وإدارة وحجز أحداث المطورين مثل الهاكاثونات والندوات والمؤتمرات.

## ✨ الميزات

### للمستخدمين
- 📅 **استعراض الأحداث** - اكتشف أحداث المطورين القادمة
- 🔍 **تفاصيل الأحداث** - عرض شامل لمعلومات الحدث
- 💼 **حجز الأحداث** - تسجيل الحضور عبر البريد الإلكتروني
- 🎯 **أحداث مشابهة** - اكتشف أحداثاً ذات صلة
- 📱 **تصميم responsive** - يعمل على جميع الأجهزة

### لمنظمي الأحداث
- ➕ **إنشاء أحداث** - أضف أحداثاً جديدة مع الصور
- ✏️ **تعديل الأحداث** - حدّث معلومات الحدث
- 🗑️ **حذف الأحداث** - احذف الأحداث القديمة
- 📊 **لوحة تحكم** - إدارة جميع الأحداث
- 📈 **تحليلات** - تتبع الحجوزات والإحصائيات

## 🛠️ التقنيات المستخدمة

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Storage**: Cloudinary
- **Icons**: Lucide React
- **Validation**: Zod
- **Analytics**: PostHog

## 📋 المتطلبات

- Node.js (v18+)
- npm أو yarn
- MongoDB Atlas أو محلي
- Cloudinary Account

## 🚀 البدء السريع

### 1. استنساخ المستودع

```bash
git clone https://github.com/yourusername/dev-events.git
cd dev-events
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dev-events
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
```

### 4. تشغيل خادم التطوير

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## 📂 بنية المشروع

```
dev-events/
├── app/
│   ├── api/              # API endpoints
│   │   ├── events/       # CRUD operations للأحداث
│   │   └── bookings/     # إدارة الحجوزات
│   ├── events/
│   │   ├── create/       # صفحة إنشاء حدث
│   │   ├── [slug]/       # صفحة تفاصيل الحدث
│   │   └── [slug]/edit/  # صفحة تعديل الحدث
│   ├── admin/            # لوحة التحكم
│   ├── layout.tsx        # القالب الرئيسي
│   └── page.tsx          # الصفحة الرئيسية
├── components/           # مكونات React
├── database/             # Mongoose models
├── lib/                  # الدوال المساعدة
│   ├── validation/       # Zod schemas
│   ├── actions/          # Server actions
│   └── errors.ts         # معالجة الأخطاء
├── public/               # الملفات الثابتة
└── package.json          # المكتبات
```

## 🔌 API Endpoints

### الأحداث

```bash
# الحصول على جميع الأحداث
GET /api/events?page=1&limit=10

# الحصول على حدث واحد
GET /api/events/[slug]

# إنشاء حدث
POST /api/events
Content-Type: multipart/form-data

# تحديث حدث
PUT /api/events/[slug]

# حذف حدث
DELETE /api/events/[slug]
```

### الحجوزات

```bash
# إنشاء حجز
POST /api/bookings

# الحصول على عدد الحجوزات
GET /api/bookings?slug=event-slug
```

## 🎨 الواجهات الجديدة

### ✨ صفحة Create Event (`/events/create`)
- نموذج شامل لإنشاء أحداث جديدة
- معاينة الصور قبل الرفع
- Validation على الـ frontend و server
- رسائل خطأ واضحة وفورية
- دعم تحميل ملفات صور بأحجام كبيرة

### ✏️ صفحة Edit Event (`/events/[slug]/edit`)
- تحميل بيانات الحدث الحالية تلقائياً
- تعديل جميع حقول الحدث
- خيار تحديث أو إبقاء الصورة القديمة
- زر حذف الحدث مع تأكيد
- منع فقدان البيانات

### 📊 Admin Dashboard (`/admin`)
- جدول منظم لجميع الأحداث
- إحصائيات فورية (أحداث قادمة، ماضية، إجمالي الحجوزات)
- بحث في الأحداث والتصفية حسب النوع
- إجراءات سريعة (تعديل وحذف)
- تأكيد قبل حذف الأحداث

## 🔒 الأمان المحسّن

✅ **Validation شامل** - على الـ frontend و server  
✅ **Input Sanitization** - قبول الحقول المصرح بها فقط  
✅ **Email Validation** - تحقق من صحة البريد الإلكتروني  
✅ **File Validation** - التحقق من حجم ونوع الملفات  
✅ **MongoDB Protection** - منع الـ injection attacks  
✅ **Error Handling** - معالجة أخطاء موحدة  

## 📊 التحسينات الرئيسية

### ✨ إضافات جديدة:

1. **Zod Validation** - Validation schema قوي للنماذج
2. **Input Sanitization** - تنظيف المدخلات من الحقول الضارة
3. **Improved Error Handling** - معالجة أخطاء موحدة وواضحة
4. **Complete CRUD** - إنشاء وقراءة وتحديث وحذف الأحداث
5. **Admin Dashboard** - لوحة تحكم متقدمة
6. **Pagination** - تقسيم الأحداث إلى صفحات
7. **Search & Filter** - بحث وتصفية الأحداث

## 🚀 النشر

### نشر على Vercel

```bash
npm install -g vercel
vercel
```

ثم أضف متغيرات البيئة في Vercel dashboard

## 📝 المساهمة

1. Fork المستودع
2. أنشئ branch جديد (`git checkout -b feature/amazing`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى البرانش (`git push origin feature/amazing`)
5. افتح Pull Request

## 📄 الترخيص

MIT License - انظر LICENSE file

## 📧 الدعم

للدعم، أرسل بريد إلى support@devevents.com أو افتح issue في GitHub

---

صنع بـ ❤️ من قبل [اسمك]

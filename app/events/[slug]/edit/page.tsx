'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { eventFormSchema } from '@/lib/validation/event.schema';

interface EventData {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  organizer: string;
  tags: string;
  image: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    overview: '',
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: 'offline',
    audience: '',
    organizer: '',
    tags: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${slug}`);
        if (!response.ok) throw new Error('فشل تحميل الحدث');
        
        const data = await response.json();
        const event = data.event;

        setFormData({
          title: event.title,
          description: event.description,
          overview: event.overview,
          venue: event.venue,
          location: event.location,
          date: event.date,
          time: event.time,
          mode: event.mode,
          audience: event.audience,
          organizer: event.organizer,
          tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags,
          image: event.image,
        });

        setImagePreview(event.image);
        setOriginalImage(event.image);
      } catch (err) {
        setErrors({ submit: err instanceof Error ? err.message : 'فشل تحميل الحدث' });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'حجم الصورة يجب أن لا يتجاوز 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const result = eventFormSchema.safeParse(formData);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formDataObj = new FormData();

      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('overview', formData.overview);
      formDataObj.append('venue', formData.venue || formData.location);
      formDataObj.append('location', formData.location);
      formDataObj.append('date', formData.date);
      formDataObj.append('time', formData.time);
      formDataObj.append('mode', formData.mode);
      formDataObj.append('audience', formData.audience);
      formDataObj.append('organizer', formData.organizer);
      formDataObj.append('tags', formData.tags);

      // Only add image if it's new
      if (fileInputRef.current?.files?.length) {
        formDataObj.append('images', fileInputRef.current.files[0]);
      }

      const response = await fetch(`/api/events/${slug}`, {
        method: 'PUT',
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || 'فشل تحديث الحدث' });
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/events/${slug}`);
      }, 2000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'حدث خطأ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setErrors({ submit: 'فشل حذف الحدث' });
        return;
      }

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'فشل حذف الحدث' });
    }
  };

  if (loading) {
    return (
      <section className="space-y-6 py-20">
        <div className="text-center">
          <p className="text-lg text-gray-400">جاري تحميل الحدث...</p>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="space-y-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-500 mb-4">✓ تم تحديث الحدث بنجاح!</h1>
          <p className="text-lg text-gray-400">جاري التحويل...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-8 md:py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="header mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Edit Event</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">Update event information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            عنوان الحدث *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            الوصف *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Overview */}
        <div className="form-group">
          <label htmlFor="overview" className="block text-sm font-medium mb-2">
            نظرة عامة *
          </label>
          <textarea
            id="overview"
            name="overview"
            value={formData.overview}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
              errors.overview ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.overview && <p className="text-red-400 text-sm mt-1">{errors.overview}</p>}
        </div>

        {/* Image */}
        <div className="form-group">
          <label htmlFor="image" className="block text-sm font-medium mb-2">
            صورة الحدث
          </label>
          {imagePreview && (
            <div className="mb-4">
              <Image
                src={imagePreview}
                alt="معاينة"
                width={400}
                height={300}
                className="rounded-lg w-full max-h-64 object-cover"
              />
              {imagePreview !== originalImage && (
                <p className="text-xs text-blue-400 mt-2">صورة جديدة محددة</p>
              )}
            </div>
          )}
          <input
            type="file"
            id="image"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="w-full"
          />
          {errors.image && <p className="text-red-400 text-sm mt-1">{errors.image}</p>}
          <p className="text-xs text-gray-400 mt-1">اترك فارغاً للاحتفاظ بالصورة الحالية</p>
        </div>

        {/* Location & Venue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              الموقع *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.location ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="venue" className="block text-sm font-medium mb-2">
              المكان
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.venue ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.venue && <p className="text-red-400 text-sm mt-1">{errors.venue}</p>}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="date" className="block text-sm font-medium mb-2">
              التاريخ *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white focus:outline-none focus:border-cyan-400 ${
                errors.date ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="time" className="block text-sm font-medium mb-2">
              الوقت *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white focus:outline-none focus:border-cyan-400 ${
                errors.time ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Mode & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="mode" className="block text-sm font-medium mb-2">
              النوع *
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white focus:outline-none focus:border-cyan-400 ${
                errors.mode ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="offline">حضوري</option>
              <option value="online">أونلاين</option>
              <option value="hybrid">هجين</option>
            </select>
            {errors.mode && <p className="text-red-400 text-sm mt-1">{errors.mode}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="audience" className="block text-sm font-medium mb-2">
              الجمهور المستهدف *
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.audience ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.audience && <p className="text-red-400 text-sm mt-1">{errors.audience}</p>}
          </div>
        </div>

        {/* Organizer & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="organizer" className="block text-sm font-medium mb-2">
              المنظم *
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.organizer ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.organizer && <p className="text-red-400 text-sm mt-1">{errors.organizer}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              الكلمات المفتاحية *
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.tags ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
          </div>
        </div>

        {/* Error */}
        {errors.submit && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black text-sm sm:text-base font-bold rounded-lg transition duration-200"
          >
            {submitting ? 'جاري التحديث...' : 'تحديث الحدث'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-600 hover:border-gray-400 text-white text-sm sm:text-base rounded-lg transition duration-200"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base font-bold rounded-lg transition duration-200"
          >
            حذف الحدث
          </button>
        </div>
      </form>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h2 className="text-2xl font-bold mb-2">حذف الحدث؟</h2>
            <p className="text-gray-400 mb-6">لا يمكن التراجع عن هذا الإجراء. سيتم فقدان جميع الحجوزات.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-400 text-white rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

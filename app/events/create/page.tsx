'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { eventFormSchema } from '@/lib/validation/event.schema';
import { z } from 'zod';

type EventFormData = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<EventFormData & { tags: string }>({
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
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must not exceed 5MB' }));
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

    // Validate using Zod
    const result = eventFormSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
    }

    // Validate image
    if (!imagePreview && !fileInputRef.current?.files?.length) {
      newErrors.image = 'Event image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      // Add text fields
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
      
      // Add agenda as array
      formDataObj.append('agenda', JSON.stringify([
        'Introduction',
        'Main Session',
        'Q&A',
        'Networking'
      ]));

      // Add image file
      if (fileInputRef.current?.files?.length) {
        formDataObj.append('images', fileInputRef.current.files[0]);
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || 'Failed to create event' });
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="space-y-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-500 mb-4">✓ Event Created Successfully!</h1>
          <p className="text-lg text-gray-400">Redirecting to home page...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-8 md:py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="header mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Create New Event</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">Add a new event to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Example: Web Development Hackathon 2024"
            className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of the event"
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
            Overview *
          </label>
          <textarea
            id="overview"
            name="overview"
            value={formData.overview}
            onChange={handleInputChange}
            placeholder="Detailed description of the event"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
              errors.overview ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.overview && <p className="text-red-400 text-sm mt-1">{errors.overview}</p>}
        </div>

        {/* Image */}
        <div className="form-group">
          <label htmlFor="image" className="block text-xs sm:text-sm font-medium mb-2">
            Event Image *
          </label>
          {imagePreview && (
            <div className="mb-4">
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={300}
                className="rounded-lg w-full max-h-48 sm:max-h-64 object-cover"
              />
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
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>

        {/* Location & Venue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Example: Amsterdam, Netherlands"
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.location ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="venue" className="block text-sm font-medium mb-2">
              Venue
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="Example: Technology Center"
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
              Date *
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
              Time *
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
              Event Type *
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
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {errors.mode && <p className="text-red-400 text-sm mt-1">{errors.mode}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="audience" className="block text-sm font-medium mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              placeholder="Example: Beginners, Professionals"
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
              Organizer *
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              placeholder="Example: Tech Community"
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.organizer ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.organizer && <p className="text-red-400 text-sm mt-1">{errors.organizer}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags *
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Example: web, javascript, react"
              className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 ${
                errors.tags ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
            <p className="text-xs text-gray-400 mt-1">Separated by commas</p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black text-sm sm:text-base font-bold rounded-lg transition duration-200"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-600 hover:border-gray-400 text-white text-sm sm:text-base rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { eventFormSchema } from '@/lib/validation/event.schema';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';

type EventFormData = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EventFormData>({
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
    capacity: '',
  });

  const [agendaItems, setAgendaItems] = useState<string[]>(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAgendaChange = (index: number, value: string) => {
    const updated = [...agendaItems];
    updated[index] = value;
    setAgendaItems(updated);
    if (errors.agenda) setErrors(prev => ({ ...prev, agenda: '' }));
  };

  const addAgendaItem = () => setAgendaItems(prev => [...prev, '']);

  const removeAgendaItem = (index: number) => {
    if (agendaItems.length === 1) return;
    setAgendaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: 'Image size must not exceed 5MB' })); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); setErrors(prev => ({ ...prev, image: '' })); };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const result = eventFormSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((err: z.ZodIssue) => { newErrors[err.path[0] as string] = err.message; });
    }
    if (!imagePreview && !fileInputRef.current?.files?.length) newErrors.image = 'Event image is required';
    const validAgenda = agendaItems.filter(a => a.trim());
    if (validAgenda.length === 0) newErrors.agenda = 'At least one agenda item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
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
      formDataObj.append('capacity', formData.capacity);
      const validAgenda = agendaItems.filter(a => a.trim());
      formDataObj.append('agenda', JSON.stringify(validAgenda));
      if (fileInputRef.current?.files?.length) formDataObj.append('images', fileInputRef.current.files[0]);

      const response = await fetch('/api/events', { method: 'POST', body: formDataObj });
      const data = await response.json();
      if (!response.ok) { setErrors({ submit: data.message || 'Failed to create event' }); return; }
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'An error occurred' });
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <section className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="create-success-icon">✓</div>
        <h1 className="create-success-title">Event Created!</h1>
        <p className="create-success-sub">Redirecting to home page...</p>
      </section>
    );
  }

  return (
    <section className="create-form-section">
      <div className="create-form-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to publish your event</p>
      </div>

      <form onSubmit={handleSubmit} className="create-form">

        {/* Title */}
        <div className="form-field">
          <label htmlFor="title">Event Title <span className="required">*</span></label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange}
            placeholder="e.g. Web Development Hackathon 2025"
            className={errors.title ? 'input-error' : ''} />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="form-field">
          <label htmlFor="description">Short Description <span className="required">*</span></label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange}
            placeholder="A brief summary of the event" rows={3}
            className={errors.description ? 'input-error' : ''} />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        {/* Overview */}
        <div className="form-field">
          <label htmlFor="overview">Overview <span className="required">*</span></label>
          <textarea id="overview" name="overview" value={formData.overview} onChange={handleInputChange}
            placeholder="Detailed description of what attendees can expect" rows={5}
            className={errors.overview ? 'input-error' : ''} />
          {errors.overview && <p className="field-error">{errors.overview}</p>}
        </div>

        {/* Image */}
        <div className="form-field">
          <label htmlFor="image">Event Image <span className="required">*</span></label>
          {imagePreview && (
            <div className="image-preview-wrap">
              <Image src={imagePreview} alt="Preview" width={600} height={300} className="image-preview" />
            </div>
          )}
          <input type="file" id="image" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="file-input" />
          {errors.image && <p className="field-error">{errors.image}</p>}
          <p className="field-hint">PNG, JPG, GIF up to 5MB</p>
        </div>

        {/* Location & Venue */}
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="location">Location <span className="required">*</span></label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange}
              placeholder="e.g. Amsterdam, Netherlands" className={errors.location ? 'input-error' : ''} />
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="venue">Venue<span className="required"> *</span></label>
            <input type="text" id="venue" name="venue" value={formData.venue} onChange={handleInputChange}
              placeholder="e.g. Tech Conference Center" className={errors.venue ? 'input-error' : ''} />
            {errors.venue && <p className="field-error">{errors.venue}</p>}
          </div>
        </div>

        {/* Date & Time */}
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="date">Date <span className="required">*</span></label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange}
              className={errors.date ? 'input-error' : ''} />
            {errors.date && <p className="field-error">{errors.date}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="time">Time <span className="required">*</span></label>
            <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange}
              className={errors.time ? 'input-error' : ''} />
            {errors.time && <p className="field-error">{errors.time}</p>}
          </div>
        </div>

        {/* Mode & Audience */}
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="mode">Event Type <span className="required">*</span></label>
            <select id="mode" name="mode" value={formData.mode} onChange={handleInputChange}
              className={errors.mode ? 'input-error' : ''}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {errors.mode && <p className="field-error">{errors.mode}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="audience">Target Audience <span className="required">*</span></label>
            <input type="text" id="audience" name="audience" value={formData.audience} onChange={handleInputChange}
              placeholder="e.g. Developers, Beginners" className={errors.audience ? 'input-error' : ''} />
            {errors.audience && <p className="field-error">{errors.audience}</p>}
          </div>
        </div>

        {/* Capacity */}
        <div className="form-field">
          <label htmlFor="capacity">Event Capacity <span className="required">*</span></label>
          <input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleInputChange}
            placeholder="e.g. 100 (maximum number of attendees)" min="1" max="100000" className={errors.capacity ? 'input-error' : ''} />
          {errors.capacity && <p className="field-error">{errors.capacity}</p>}
          <p className="field-hint">Maximum number of people who can book this event</p>
        </div>

        {/* Organizer & Tags */}
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="organizer">Organizer <span className="required">*</span></label>
            <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleInputChange}
              placeholder="e.g. Tech Community" className={errors.organizer ? 'input-error' : ''} />
            {errors.organizer && <p className="field-error">{errors.organizer}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="tags">Tags <span className="required">*</span></label>
            <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange}
              placeholder="e.g. web, javascript, react" className={errors.tags ? 'input-error' : ''} />
            {errors.tags && <p className="field-error">{errors.tags}</p>}
            <p className="field-hint">Separated by commas</p>
          </div>
        </div>

        {/* Agenda */}
        <div className="form-field">
          <label>Agenda <span className="required">*</span></label>
          <p className="field-hint mb-3">Add the schedule items for your event</p>
          <div className="agenda-builder">
            {agendaItems.map((item, index) => (
              <div key={index} className="agenda-item-row">
                <span className="agenda-grip"><GripVertical size={16} /></span>
                <span className="agenda-number">{index + 1}</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleAgendaChange(index, e.target.value)}
                  placeholder={`e.g. ${['Opening Keynote', 'Workshop Session', 'Panel Discussion', 'Networking'][index % 4]}`}
                  className="agenda-input"
                />
                <button type="button" onClick={() => removeAgendaItem(index)} className="agenda-remove" disabled={agendaItems.length === 1}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addAgendaItem} className="agenda-add-btn">
              <Plus size={16} /> Add Agenda Item
            </button>
          </div>
          {errors.agenda && <p className="field-error mt-2">{errors.agenda}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="submit-error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="btn-spinner" /> Creating...
              </span>
            ) : 'Create Event'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </section>
  );
}

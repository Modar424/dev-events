'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { eventFormSchema } from '@/lib/validation/event.schema';
import { Plus, Trash2, GripVertical } from 'lucide-react';

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
  capacity: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EventData>({
    title: '', description: '', overview: '', venue: '', location: '',
    date: '', time: '', mode: 'offline', audience: '', organizer: '', tags: '', image: '', capacity: '',
  });

  const [agendaItems, setAgendaItems] = useState<string[]>(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${slug}`);
        if (!response.ok) throw new Error('Failed to load event');
        const data = await response.json();
        const event = data.event;

        setFormData({
          title: event.title, description: event.description, overview: event.overview,
          venue: event.venue, location: event.location, date: event.date, time: event.time,
          mode: event.mode, audience: event.audience, organizer: event.organizer,
          tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags,
          image: event.image, capacity: event.capacity?.toString() || '',
        });

        // Normalize agenda from DB
        if (event.agenda && Array.isArray(event.agenda) && event.agenda.length > 0) {
          let items: string[] = event.agenda;
          if (items.length === 1 && items[0].startsWith('[')) {
            try { items = JSON.parse(items[0]); } catch { /* ignore */ }
          }
          setAgendaItems(items.length > 0 ? items : ['']);
        }

        setImagePreview(event.image);
        setOriginalImage(event.image);
      } catch (err) {
        setErrors({ submit: err instanceof Error ? err.message : 'Failed to load event' });
      } finally { setLoading(false); }
    };
    fetchEvent();
  }, [slug]);

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
      if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: 'Image must not exceed 5MB' })); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); setErrors(prev => ({ ...prev, image: '' })); };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Create validation object without image field
    const { image: _, ...validationData } = formData;
    const result = eventFormSchema.safeParse(validationData);
    if (!result.success) {
      result.error.issues.forEach((err) => { newErrors[err.path[0] as string] = err.message; });
    }
    const validAgenda = agendaItems.filter(a => a.trim());
    if (validAgenda.length === 0) newErrors.agenda = 'At least one agenda item is required';
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
      formDataObj.append('capacity', formData.capacity);
      const validAgenda = agendaItems.filter(a => a.trim());
      formDataObj.append('agenda', JSON.stringify(validAgenda));
      if (fileInputRef.current?.files?.length) formDataObj.append('images', fileInputRef.current.files[0]);

      const response = await fetch(`/api/events/${slug}`, { method: 'PUT', body: formDataObj });
      const data = await response.json();
      if (!response.ok) { setErrors({ submit: data.message || 'Failed to update event' }); return; }
      setSuccess(true);
      setTimeout(() => router.push(`/events/${slug}`), 2000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'An error occurred' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`, { method: 'DELETE' });
      if (!response.ok) { setErrors({ submit: 'Failed to delete event' }); return; }
      setTimeout(() => router.push('/'), 1000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to delete event' });
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  if (success) {
    return (
      <section className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="create-success-icon">✓</div>
        <h1 className="create-success-title">Event Updated!</h1>
        <p className="create-success-sub">Redirecting...</p>
      </section>
    );
  }

  return (
    <section className="create-form-section">
      <div className="create-form-header">
        <h1>Edit Event</h1>
        <p>Update the event information</p>
      </div>

      <form onSubmit={handleSubmit} className="create-form">

        <div className="form-field">
          <label htmlFor="title">Event Title <span className="required">*</span></label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className={errors.title ? 'input-error' : ''} />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="description">Short Description <span className="required">*</span></label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className={errors.description ? 'input-error' : ''} />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="overview">Overview <span className="required">*</span></label>
          <textarea id="overview" name="overview" value={formData.overview} onChange={handleInputChange} rows={5} className={errors.overview ? 'input-error' : ''} />
          {errors.overview && <p className="field-error">{errors.overview}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="image">Event Image</label>
          {imagePreview && (
            <div className="image-preview-wrap">
              <Image src={imagePreview} alt="Preview" width={600} height={300} className="image-preview" />
              {imagePreview !== originalImage && <p className="field-hint mt-1" style={{ color: 'var(--primary)' }}>New image selected</p>}
            </div>
          )}
          <input type="file" id="image" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="file-input" />
          {errors.image && <p className="field-error">{errors.image}</p>}
          <p className="field-hint">Leave empty to keep current image</p>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="location">Location <span className="required">*</span></label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className={errors.location ? 'input-error' : ''} />
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="venue">Venue</label>
            <input type="text" id="venue" name="venue" value={formData.venue} onChange={handleInputChange} className={errors.venue ? 'input-error' : ''} />
            {errors.venue && <p className="field-error">{errors.venue}</p>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="date">Date <span className="required">*</span></label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className={errors.date ? 'input-error' : ''} />
            {errors.date && <p className="field-error">{errors.date}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="time">Time <span className="required">*</span></label>
            <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} className={errors.time ? 'input-error' : ''} />
            {errors.time && <p className="field-error">{errors.time}</p>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="mode">Event Type <span className="required">*</span></label>
            <select id="mode" name="mode" value={formData.mode} onChange={handleInputChange} className={errors.mode ? 'input-error' : ''}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {errors.mode && <p className="field-error">{errors.mode}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="audience">Target Audience <span className="required">*</span></label>
            <input type="text" id="audience" name="audience" value={formData.audience} onChange={handleInputChange} className={errors.audience ? 'input-error' : ''} />
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

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="organizer">Organizer <span className="required">*</span></label>
            <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleInputChange} className={errors.organizer ? 'input-error' : ''} />
            {errors.organizer && <p className="field-error">{errors.organizer}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="tags">Tags <span className="required">*</span></label>
            <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} className={errors.tags ? 'input-error' : ''} />
            {errors.tags && <p className="field-error">{errors.tags}</p>}
            <p className="field-hint">Separated by commas</p>
          </div>
        </div>

        {/* Agenda */}
        <div className="form-field">
          <label>Agenda <span className="required">*</span></label>
          <p className="field-hint mb-3">Event schedule items</p>
          <div className="agenda-builder">
            {agendaItems.map((item, index) => (
              <div key={index} className="agenda-item-row">
                <span className="agenda-grip"><GripVertical size={16} /></span>
                <span className="agenda-number">{index + 1}</span>
                <input type="text" value={item} onChange={(e) => handleAgendaChange(index, e.target.value)}
                  placeholder={`Agenda item ${index + 1}`} className="agenda-input" />
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

        {errors.submit && (
          <div className="submit-error"><p>{errors.submit}</p></div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <span className="flex items-center justify-center gap-2"><span className="btn-spinner" /> Updating...</span> : 'Update Event'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="btn-danger">Delete Event</button>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Delete Event?</h2>
            <p>This action cannot be undone. All bookings will be lost.</p>
            <div className="delete-modal-actions">
              <button onClick={handleDelete} className="btn-danger">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  
  overview: z.string()
    .min(20, 'Overview must be at least 20 characters')
    .max(2000, 'Overview cannot exceed 2000 characters'),
  
  location: z.string()
    .min(3, 'Location is required')
    .max(100, 'Location cannot exceed 100 characters'),
  
  venue: z.string()
    .min(3, 'Venue is required')
    .max(100, 'Venue cannot exceed 100 characters'),
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  
  mode: z.enum(['online', 'offline', 'hybrid']),
  
  audience: z.string()
    .min(3, 'Target audience is required'),
  
  organizer: z.string()
    .min(3, 'Organizer is required'),
  
  tags: z.string()
    .min(1, 'Tags are required'),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
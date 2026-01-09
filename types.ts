export interface Photo {
  id: string;
  displayId?: string; // New short, readable ID (e.g., "A1B2C")
  url: string;
  caption?: string;
  tags?: string[];
  createdAt: number;
}

export interface PickleballEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  coverImage: string;
  organizer?: string;
  category?: string; // e.g., "Open", "Mista", "Iniciante"
  status?: 'upcoming' | 'live' | 'completed';
  tags?: string[];
  photos: Photo[];
  totalPhotos?: number; // Optimization: store count on parent doc
  createdAt: number;
}

export interface AdminStats {
  totalEvents: number;
  totalPhotos: number;
  views: number;
}

// Helper type for uploading
export interface PhotoUploadDraft {
  file: File;
  preview: string;
  caption: string;
  tags: string;
}
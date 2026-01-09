import { db, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PickleballEvent, Photo, PhotoUploadDraft } from '../types';

const EVENTS_COLLECTION = 'events';
const AUTH_KEY = 'pb_is_admin';

export const dataService = {
  getEvents: async (): Promise<PickleballEvent[]> => {
    try {
      const q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        photos: [] // Don't fetch all photos in list view to save bandwidth
      })) as PickleballEvent[];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  getEventById: async (id: string): Promise<PickleballEvent | undefined> => {
    try {
      const eventDocRef = doc(db, EVENTS_COLLECTION, id);
      const eventDoc = await getDoc(eventDocRef);
      
      if (!eventDoc.exists()) return undefined;

      // Fetch photos subcollection
      const photosColRef = collection(db, EVENTS_COLLECTION, id, 'photos');
      const q = query(photosColRef, orderBy('createdAt', 'desc'));
      const photosSnapshot = await getDocs(q);
      
      const photos = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];

      return {
        id: eventDoc.id,
        ...eventDoc.data(),
        photos: photos
      } as PickleballEvent;
    } catch (error) {
      console.error("Error fetching event:", error);
      return undefined;
    }
  },

  createEvent: async (event: Omit<PickleballEvent, 'id' | 'createdAt' | 'photos'>): Promise<PickleballEvent> => {
    try {
      const newEvent = {
        ...event,
        createdAt: Date.now(),
        totalPhotos: 0,
        status: event.status || 'completed'
      };
      
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEvent);
      
      return {
        id: docRef.id,
        ...newEvent,
        photos: []
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  updateEvent: async (id: string, eventData: Partial<PickleballEvent>): Promise<void> => {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, id);
      // Remove undefined fields to prevent firestore errors
      const cleanData = Object.fromEntries(
        Object.entries(eventData).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(eventRef, cleanData);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  uploadPhotos: async (eventId: string, drafts: PhotoUploadDraft[]): Promise<void> => {
    try {
      const uploadPromises = drafts.map(async (draft) => {
        // 1. Upload to Storage
        const fileRef = ref(storage, `events/${eventId}/${Date.now()}_${draft.file.name}`);
        await uploadBytes(fileRef, draft.file);
        const url = await getDownloadURL(fileRef);

        // 2. Add to Firestore Subcollection with Metadata
        // Parse tags string into array
        const tagsArray = draft.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const photoData = {
          url,
          caption: draft.caption,
          tags: tagsArray,
          createdAt: Date.now()
        };
        await addDoc(collection(db, EVENTS_COLLECTION, eventId, 'photos'), photoData);
        return photoData;
      });

      await Promise.all(uploadPromises);

      // 3. Update totalPhotos count on parent document
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const currentTotal = eventSnap.data().totalPhotos || 0;
        await updateDoc(eventRef, {
          totalPhotos: currentTotal + drafts.length
        });
      }

    } catch (error) {
      console.error("Error uploading photos:", error);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  isAdmin: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  login: (password: string): boolean => {
    if (password === 'admin123') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};
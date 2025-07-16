// src/features/bookmark/services/bookmarkService.js
import { db } from '../../../firebase/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

const bookmarksCollection = collection(db, 'bookmarks');

// ✅ Ambil semua bookmark milik user
export const getBookmarks = async (userId) => {
  if (!userId) throw new Error('User ID is required to fetch bookmarks');

  const q = query(bookmarksCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Tambahkan bookmark baru, atau kembalikan jika sudah ada
export const addBookmark = async (userId, news) => {
  if (!userId) throw new Error('User ID is required to add bookmark');
  if (!news || !news.id) throw new Error('Valid news object with id is required');

  const q = query(
    bookmarksCollection,
    where('userId', '==', userId),
    where('newsId', '==', news.id)
  );
  const snapshot = await getDocs(q);

  // ❗Jika sudah ada, return dokumen yang ada (tidak error)
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  // Siapkan data author
  const authorData =
    news.author && typeof news.author === 'object'
      ? news.author
      : { id: '', name: 'Unknown', profilePicture: null };

  const bookmarkData = {
    userId,
    newsId: news.id,
    newsTitle: news.title || 'No Title',
    newsImage: news.image || null,
    author: authorData,
    content: news.content || '',
    comments: Array.isArray(news.comments) ? news.comments : [],
    likes: typeof news.likes === 'number' ? news.likes : 0,
    createdAt: news.createdAt || new Date(),
  };

  const docRef = await addDoc(bookmarksCollection, bookmarkData);
  return { id: docRef.id, ...bookmarkData };
};

// ✅ Hapus bookmark berdasarkan ID dokumen
export const removeBookmark = async (bookmarkId) => {
  if (!bookmarkId) throw new Error('Bookmark ID is required to remove bookmark');

  const docRef = doc(db, 'bookmarks', bookmarkId);
  await deleteDoc(docRef);
  return true;
};

// ✅ Cek apakah berita sudah di-bookmark oleh user
export const isBookmarked = async (userId, newsId) => {
  if (!userId || !newsId) return false;

  const q = query(
    bookmarksCollection,
    where('userId', '==', userId),
    where('newsId', '==', newsId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ✅ Update semua bookmark yang terkait berita tertentu
export const updateBookmarksForNews = async (newsId, updatedNewsData) => {
  if (!newsId || !updatedNewsData) throw new Error('Parameter tidak valid');

  const q = query(bookmarksCollection, where('newsId', '==', newsId));
  const snapshot = await getDocs(q);

  const authorData =
    updatedNewsData.author && typeof updatedNewsData.author === 'object'
      ? updatedNewsData.author
      : { id: '', name: 'Unknown', profilePicture: null };

  const updates = snapshot.docs.map(async (docSnap) => {
    const docRef = doc(db, 'bookmarks', docSnap.id);
    await updateDoc(docRef, {
      newsTitle: updatedNewsData.title || '',
      newsImage: updatedNewsData.image || null,
      content: updatedNewsData.content || '',
      author: authorData,
      comments: Array.isArray(updatedNewsData.comments)
        ? updatedNewsData.comments
        : [],
      likes:
        typeof updatedNewsData.likesCount === 'number'
          ? updatedNewsData.likesCount
          : 0,
      createdAt: updatedNewsData.createdAt || new Date(),
    });
  });

  await Promise.all(updates);
};

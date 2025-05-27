// src/features/news/services/newsService.js
import { db } from '../../../firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// Referensi koleksi news
const newsCollection = collection(db, 'news');

// Fetch all news, sorted by createdAt desc
export const fetchNews = async () => {
  const q = query(newsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch news by ID
export const fetchNewsById = async (id) => {
  const docRef = doc(db, 'news', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('News not found');
  return { id: docSnap.id, ...docSnap.data() };
};

// Search news by query on title or content
export const searchNews = async (queryStr) => {
  if (!queryStr) return [];

  const qTitle = query(
    newsCollection,
    where('title', '>=', queryStr),
    where('title', '<=', queryStr + '\uf8ff')
  );
  const qContent = query(
    newsCollection,
    where('content', '>=', queryStr),
    where('content', '<=', queryStr + '\uf8ff')
  );

  const [snapTitle, snapContent] = await Promise.all([getDocs(qTitle), getDocs(qContent)]);

  const resultsMap = new Map();

  snapTitle.docs.forEach(doc => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));
  snapContent.docs.forEach(doc => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));

  return Array.from(resultsMap.values());
};

// Add new news
export const addNews = async (newsData) => {
  const now = new Date();
  const newNews = {
    ...newsData,
    createdAt: now,
    updatedAt: now,
    comments: [],
    likes: 0,
  };
  const docRef = await addDoc(newsCollection, newNews);
  const addedDoc = await getDoc(docRef);
  return { id: docRef.id, ...addedDoc.data() };
};

// Update existing news by id
export const updateNews = async (id, data) => {
  const docRef = doc(db, 'news', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// Delete news by id
export const deleteNews = async (id) => {
  const docRef = doc(db, 'news', id);
  await deleteDoc(docRef);
  return true;
};

// Add comment to news
export const addComment = async (newsId, comment) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('News not found');

  const newsData = newsDoc.data();
  const newComment = {
    id: String((newsData.comments?.length || 0) + 1),
    ...comment,
    createdAt: new Date(),
  };

  const updatedComments = [...(newsData.comments || []), newComment];

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// Update likes count (optional, if you want to store likes count in DB)
export const updateLikes = async (id, likes) => {
  const docRef = doc(db, 'news', id);
  await updateDoc(docRef, {
    likes,
    updatedAt: new Date(),
  });
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

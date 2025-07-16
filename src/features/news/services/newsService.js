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

// Import the bookmark service to sync updates
import { updateBookmarksForNews } from '../../bookmark/services/bookmarkService';

// Referensi koleksi news
const newsCollection = collection(db, 'news');

// --- Fungsi Pembantu Rekursif untuk Komentar ---

// Fungsi pembantu untuk menemukan dan memperbarui/menghapus komentar secara rekursif
const updateCommentRecursive = (commentsArr, commentId, updates) => {
  return commentsArr.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, ...updates };
    }
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = updateCommentRecursive(comment.replies, commentId, updates);
      // Hanya update replies jika ada perubahan
      if (updatedReplies.some((reply, index) => reply !== comment.replies[index])) {
        return { ...comment, replies: updatedReplies };
      }
    }
    return comment;
  });
};

// Fungsi pembantu untuk menemukan dan menghapus komentar secara rekursif
const deleteCommentRecursive = (commentsArr, commentId) => {
  return commentsArr.filter((comment) => {
    if (comment.id === commentId) {
      return false; // Hapus komentar ini
    }
    if (comment.replies && comment.replies.length > 0) {
      comment.replies = deleteCommentRecursive(comment.replies, commentId);
    }
    return true; // Pertahankan komentar ini
  });
};

// --- Fungsi NEWS yang Ada (dengan sedikit penyesuaian inisialisasi) ---

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
  if (!docSnap.exists()) throw new Error('Berita tidak ditemukan');
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

// Add new news dengan inisialisasi likedBy dan likesCount
export const addNews = async (newsData) => {
  const now = new Date();
  const newNews = {
    ...newsData,
    createdAt: now,
    updatedAt: now,
    comments: [],
    likesCount: 0,
    likedBy: [],
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
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  // Update related bookmarks
  try {
    await updateBookmarksForNews(id, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Delete news by id
export const deleteNews = async (id) => {
  const docRef = doc(db, 'news', id);
  await deleteDoc(docRef);
  return true;
};

// --- Fungsi KOMENTAR yang Diperbarui dan Baru ---

// Add top-level comment to news
export const addComment = async (newsId, comment) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const newComment = {
    id: String(Date.now()), // ID unik
    ...comment,
    createdAt: new Date(),
    likesCount: 0, // Inisialisasi suka
    likedBy: [], // Inisialisasi daftar pengguna yang menyukai
    replies: [], // Inisialisasi balasan
  };

  const updatedComments = [...(newsData.comments || []), newComment];

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Add reply to a specific comment (termasuk rekursif)
export const addReplyToComment = async (newsId, parentCommentId, reply) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const comments = newsData.comments || [];

  const newReply = {
    id: String(Date.now()), // ID unik untuk balasan
    ...reply,
    createdAt: new Date(),
    likesCount: 0,
    likedBy: [],
    replies: [],
  };

  const addReplyRecursive = (commentsArr, targetCommentId) => {
    return commentsArr.map((comment) => {
      if (comment.id === targetCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyRecursive(comment.replies, targetCommentId),
        };
      }
      return comment;
    });
  };

  const updatedComments = addReplyRecursive(comments, parentCommentId);

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Update comment (sekarang rekursif)
export const updateComment = async (newsId, commentId, newContent) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const comments = newsData.comments || [];

  const updatedComments = updateCommentRecursive(comments, commentId, {
    content: newContent,
    updatedAt: new Date(),
  });

  // Periksa apakah ada perubahan setelah pembaruan rekursif
  if (JSON.stringify(comments) === JSON.stringify(updatedComments)) {
    throw new Error('Komentar tidak ditemukan atau kontennya tidak berubah.');
  }

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Delete comment (sekarang rekursif)
export const deleteComment = async (newsId, commentId) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const comments = newsData.comments || [];

  const initialLength = JSON.stringify(comments).length; // Gunakan panjang string sebagai proxy perubahan
  const updatedComments = deleteCommentRecursive(comments, commentId);
  const finalLength = JSON.stringify(updatedComments).length;

  if (initialLength === finalLength) {
    throw new Error('Komentar tidak ditemukan atau tidak ada perubahan.');
  }

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Toggle like untuk komentar (BARU dan rekursif)
export const toggleCommentLike = async (newsId, commentId, userId) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const comments = newsData.comments || [];

  let commentFoundAndUpdated = false;

  const updateCommentLikesRecursive = (commentsArr, targetCommentId) => {
    return commentsArr.map((comment) => {
      if (comment.id === targetCommentId) {
        const likedBy = comment.likedBy || [];
        const hasLiked = likedBy.includes(userId);

        let updatedLikedBy;
        if (hasLiked) {
          updatedLikedBy = likedBy.filter((id) => id !== userId); // tidak suka
        } else {
          updatedLikedBy = [...likedBy, userId]; // suka
        }
        commentFoundAndUpdated = true;
        return {
          ...comment,
          likedBy: updatedLikedBy,
          likesCount: updatedLikedBy.length,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = updateCommentLikesRecursive(comment.replies, targetCommentId);
        // Hanya update replies jika ada perubahan
        if (updatedReplies.some((reply, index) => reply !== comment.replies[index])) {
          commentFoundAndUpdated = true;
          return { ...comment, replies: updatedReplies };
        }
      }
      return comment;
    });
  };

  const updatedComments = updateCommentLikesRecursive(comments, commentId);

  if (!commentFoundAndUpdated) {
    throw new Error('Komentar tidak ditemukan untuk diperbarui suka.');
  }

  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};

// Toggle like untuk berita (tetap sama)
export const toggleLike = async (newsId, userId) => {
  const docRef = doc(db, 'news', newsId);
  const newsDoc = await getDoc(docRef);
  if (!newsDoc.exists()) throw new Error('Berita tidak ditemukan');

  const newsData = newsDoc.data();
  const likedBy = newsData.likedBy || [];
  const hasLiked = likedBy.includes(userId);

  let updatedLikedBy;
  if (hasLiked) {
    updatedLikedBy = likedBy.filter(id => id !== userId); // unlike
  } else {
    updatedLikedBy = [...likedBy, userId]; // like
  }

  const updatedLikesCount = updatedLikedBy.length;

  await updateDoc(docRef, {
    likedBy: updatedLikedBy,
    likesCount: updatedLikesCount,
    updatedAt: new Date(),
  });

  const updatedDoc = await getDoc(docRef);
  const updatedNews = { id: updatedDoc.id, ...updatedDoc.data() };

  // Update related bookmarks - this is the key part for your requirement
  try {
    await updateBookmarksForNews(newsId, updatedNews);
  } catch (error) {
    console.error('Gagal memperbarui bookmark:', error);
  }

  return updatedNews;
};
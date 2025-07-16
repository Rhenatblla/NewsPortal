import { db } from '../../../firebase/firebaseConfig';
import {
  collection, addDoc, updateDoc, doc,
  deleteDoc, query, where, getDocs, increment, Timestamp
} from 'firebase/firestore';

export const addCommentToNews = async (newsId, commentData, parentId = null) => {
  const commentRef = collection(db, 'comments');
  const newComment = {
    newsId,
    content: commentData.content,
    author: commentData.author,
    parentId,
    createdAt: Timestamp.now(),
    likedBy: [],
    likesCount: 0
  };

  await addDoc(commentRef, newComment);
  await updateDoc(doc(db, 'news', newsId), { commentsCount: increment(1) });
};

export const getCommentsByNewsId = async (newsId) => {
  const q = query(collection(db, 'comments'), where('newsId', '==', newsId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteCommentById = async (commentId, newsId) => {
  await deleteDoc(doc(db, 'comments', commentId));
  await updateDoc(doc(db, 'news', newsId), { commentsCount: increment(-1) });
};

export const updateCommentById = async (commentId, newContent) => {
  await updateDoc(doc(db, 'comments', commentId), {
    content: newContent
  });
};

export const toggleCommentLike = async (commentId, userId, likedBy) => {
  const commentRef = doc(db, 'comments', commentId);
  const isLiked = likedBy.includes(userId);
  const updatedLikedBy = isLiked
    ? likedBy.filter(id => id !== userId)
    : [...likedBy, userId];

  await updateDoc(commentRef, {
    likedBy: updatedLikedBy,
    likesCount: isLiked ? increment(-1) : increment(1)
  });
};

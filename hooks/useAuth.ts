'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/firebaseConfig';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 確保產生或取得 localStorage guestId
    const key = 'arch_guest_id';
    let localId = localStorage.getItem(key);
    if (!localId) {
      localId = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, localId);
    }
    setGuestId(localId);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // 將 user ID 存入 Cookie 供後續伺服器端或全域使用
      if (currentUser) {
        document.cookie = `arch_user_id=${currentUser.uid}; path=/; max-age=31536000`; // 1 year
      } else {
        document.cookie = `arch_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => unsubscribe();
  }, []);

  // 當使用者登入時，用他的 UID 取代 Guest ID
  const activeId = user ? user.uid : guestId;

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google 登入失敗', err);
      const errorObj = err as any;
      if (errorObj?.code === 'auth/configuration-not-found') {
        alert('登入失敗：Firebase 後台尚未啟用 Google 登入功能。\n請管理員至 Firebase Console 開啟 Authentication 的 Google 登入。');
      } else {
        alert(`登入發生錯誤：${errorObj?.message || '未知錯誤'}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('登出失敗', err);
    }
  };

  return {
    user,
    activeId,
    loading,
    loginWithGoogle,
    logout,
  };
}

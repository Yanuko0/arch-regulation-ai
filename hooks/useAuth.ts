'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/firebaseConfig';

export function useAuth() {
   const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // ... 原有代碼 ...
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
      if (currentUser) {
        document.cookie = `arch_user_id=${currentUser.uid}; path=/; max-age=31536000`;
      } else {
        document.cookie = `arch_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => unsubscribe();
  }, []);

  const activeId = user ? user.uid : guestId;

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google 登入失敗', err);
      
      // 過濾掉使用者主動關閉或重複點擊視窗的情況
      const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
      if (ignoredErrors.includes(err?.code)) {
        return;
      }

      if (err?.code === 'auth/configuration-not-found') {
        setAuthError('登入失敗：Firebase 後台尚未啟用 Google 登入功能。');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setAuthError('登入失敗：此網域尚未在 Firebase 授權名單中。');
      } else {
        setAuthError(`登入發生錯誤：${err?.message || '未知錯誤'}`);
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
    authError,
    setAuthError,
    loginWithGoogle,
    logout,
  };
}

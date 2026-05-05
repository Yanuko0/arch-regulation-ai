// hooks/useGuestId.ts
'use client';
import { useEffect, useState } from 'react';
import { randomUUID } from 'crypto';

/**
 * 取得或建立 Guest ID（儲存於 localStorage）
 * 無登入版本：用此 ID 識別不同用戶的對話
 */
export function useGuestId(): string {
  const [guestId, setGuestId] = useState<string>('');

  useEffect(() => {
    const key = 'arch_guest_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
}

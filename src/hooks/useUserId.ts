'use client';

import { useEffect, useState } from 'react';
import { generateId } from '@/lib/utils';

export function useUserId(): string {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('retro_user_id');
    if (!id) {
      id = generateId();
      localStorage.setItem('retro_user_id', id);
    }
    setUserId(id);
  }, []);

  return userId;
}

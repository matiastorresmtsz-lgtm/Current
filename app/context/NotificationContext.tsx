"use client";

import React, { createContext, useContext, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

interface NotificationContextValue {
  notifications: AppNotification[];
  // allow callers to omit `id` and `unread`; `time` may be omitted and will be filled in
  addNotification: (n: Omit<AppNotification, 'id' | 'unread'> & Partial<Pick<AppNotification, 'time'>>) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

function nowLabel() {
  return 'just now';
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (n: Omit<AppNotification, 'id' | 'unread'> & Partial<Pick<AppNotification, 'time'>>) => {
    if (!isSignedIn) return; // only create notifications for signed-in users
    // Destructure to ensure we explicitly set `time` once and avoid duplicate-key warnings
    const { time, ...rest } = n as Omit<AppNotification, 'id' | 'unread'> & Partial<Pick<AppNotification, 'time'>>;
    const item: AppNotification = {
      ...rest,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      unread: true,
      time: time ?? nowLabel(),
    } as AppNotification;

    setNotifications((s) => [item, ...s].slice(0, 100));
  };

  const markAllRead = () => {
    setNotifications((s) => s.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((s) => s.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

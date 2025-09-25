// stores/notification.ts
import { create } from 'zustand';
import * as Notifications from 'expo-notifications';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  receivedAt: Date;
}

interface NotificationStore {
  // 상태
  currentNotification: Notifications.Notification | null;
  notificationHistory: NotificationData[];
  pushToken: string | null;
  
  // 액션
  setCurrentNotification: (notification: Notifications.Notification | null) => void;
  addToHistory: (notification: NotificationData) => void;
  setPushToken: (token: string | null) => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // 초기 상태
  currentNotification: null,
  notificationHistory: [],
  pushToken: null,
  
  // 액션들
  setCurrentNotification: (notification) => {
    set({ currentNotification: notification });
    
    // 알림이 들어오면 히스토리에도 추가
    if (notification) {
      const notificationData: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title || '알림',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        receivedAt: new Date(),
      };
      
      get().addToHistory(notificationData);
    }
  },
  
  addToHistory: (notification) => {
    set((state) => ({
      notificationHistory: [notification, ...state.notificationHistory].slice(0, 50) // 최근 50개만 보관
    }));
  },
  
  setPushToken: (token) => set({ pushToken: token }),
  
  clearHistory: () => set({ notificationHistory: [] }),
}));
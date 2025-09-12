// src/mocks/handlers.ts
import { dashboardHandlers } from './dashboard'

// 모든 핸들러들을 통합하여 export
export const handlers = [
  ...dashboardHandlers,
  // 나중에 다른 핸들러들도 여기에 추가
  // ...authHandlers,
  // ...profileHandlers,
]
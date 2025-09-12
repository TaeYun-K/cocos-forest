// src/mocks/server.ts
import { setupServer } from 'msw/native'
import { handlers } from './handlers'
 
export const server = setupServer(...handlers)
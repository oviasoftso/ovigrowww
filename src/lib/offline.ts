import Dexie, { Table } from 'dexie'

const DB_NAME = 'ovigrow-offline'
const DB_VERSION = 1

// Define the database schema
export class OfflineDatabase extends Dexie {
  chatMessages!: Table<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    model?: string
  }, string>
  
  syncQueue!: Table<{
    id: string
    action: 'create' | 'update' | 'delete'
    store: string
    data: unknown
    timestamp: number
    retries: number
  }, string>
  
  cache!: Table<{
    key: string
    data: unknown
    timestamp: number
    ttl: number
  }, string>
  
  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      chatMessages: '++id, timestamp',
      syncQueue: '++id, timestamp, retries',
      cache: '++key, timestamp'
    })
  }
}

export const db = new OfflineDatabase()

// Chat message operations
export async function saveChatMessage(msg: { id: string; role: 'user' | 'assistant'; content: string; model?: string }) {
  await db.chatMessages.add({ ...msg, timestamp: Date.now() })
}

export async function getChatMessages(): Promise<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number; model?: string }>> {
  return await db.chatMessages.orderBy('timestamp').reverse().toArray()
}

export async function clearChatMessages() {
  await db.chatMessages.clear()
}

// Sync queue operations
export async function addToSyncQueue(action: 'create' | 'update' | 'delete', store: string, data: unknown) {
  const id = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await db.syncQueue.add({
    id,
    action,
    store,
    data,
    timestamp: Date.now(),
    retries: 0
  })
}

export async function getSyncQueue() {
  return await db.syncQueue.orderBy('timestamp').toArray()
}

export async function removeSyncItem(id: string) {
  await db.syncQueue.delete(id)
}

export async function clearSyncQueue() {
  await db.syncQueue.clear()
}

// Cache operations
export async function getCached(key: string): Promise<unknown | null> {
  const entry = await db.cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    await db.cache.delete(key)
    return null
  }
  return entry.data
}

export async function setCache(key: string, data: unknown, ttl: number) {
  await db.cache.put({ key, data, timestamp: Date.now(), ttl })
}

export async function clearCache() {
  await db.cache.clear()
}

// Online/offline detection
export function setupOnlineDetection(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => onOnline()
  const handleOffline = () => onOffline()

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export function isOnline(): boolean {
  return navigator.onLine
}

// Process sync queue when back online
export async function processSyncQueue() {
  const queue = await getSyncQueue()
  if (queue.length === 0) return

  // In a real app, this would sync with Supabase
  // For now, we just clear the queue since data is local
  // But we'll keep track of retries for failed operations
  const itemsToProcess = await db.syncQueue.toArray()
  
  for (const item of itemsToProcess) {
    try {
      // Sync logic would go here - in a real implementation,
      // this would send data to Supabase backend
      console.log('Processing sync item:', item)
      
      // For demo purposes, we'll just remove the item
      await removeSyncItem(item.id)
    } catch (error) {
      console.error('Failed to process sync item:', item, error)
      
      // Keep in queue for retry if under max retries
      if (item.retries < 3) {
        await db.syncQueue.update(item.id, { retries: item.retries + 1 })
      } else {
        // Remove after max retries to prevent infinite loop
        await removeSyncItem(item.id)
      }
    }
  }
}

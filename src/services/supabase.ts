import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { JournalEntry } from '../types'

const LS_URL_KEY = 'vaishh_supabase_url'
const LS_ANON_KEY = 'vaishh_supabase_anon_key'

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

  const localUrl = localStorage.getItem(LS_URL_KEY) || ''
  const localKey = localStorage.getItem(LS_ANON_KEY) || ''

  return {
    url: (localUrl || envUrl).trim(),
    anonKey: (localKey || envKey).trim(),
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials()
  return (
    url.length > 0 &&
    anonKey.length > 20 &&
    (url.startsWith('https://') || url.startsWith('http://'))
  )
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(LS_URL_KEY, url.trim())
  localStorage.setItem(LS_ANON_KEY, anonKey.trim())
  supabaseInstance = null // Force recreation on next use
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance

  const { url, anonKey } = getSupabaseCredentials()
  if (!isSupabaseConfigured()) return null

  try {
    supabaseInstance = createClient(url, anonKey)
    return supabaseInstance
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err)
    return null
  }
}

/**
 * Fetch all entries from Supabase.
 * Returns null if not configured or on network error.
 */
export async function fetchRemoteEntries(): Promise<JournalEntry[] | null> {
  const client = getSupabaseClient()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('journal_entries')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch error:', error.message)
      return null
    }

    if (!data) return []

    return data.map((row: any): JournalEntry => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || undefined,
      content: row.content,
      date: row.date,
      createdAt: typeof row.created_at === 'number' ? row.created_at : parseInt(row.created_at, 10) || Date.now(),
      mood: row.mood || undefined,
      category: row.category || undefined,
      collection: row.collection || undefined,
      sort_order: row.sort_order ?? undefined,
      tags: Array.isArray(row.tags) ? row.tags : [],
    }))
  } catch (err) {
    console.warn('Network error fetching from Supabase:', err)
    return null
  }
}

/**
 * Push an individual entry to Supabase
 */
export async function upsertRemoteEntry(entry: JournalEntry): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false

  try {
    const { error } = await client.from('journal_entries').upsert({
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle || null,
      content: entry.content,
      date: entry.date,
      mood: entry.mood || null,
      category: entry.category || null,
      collection: entry.collection || null,
      sort_order: entry.sort_order ?? null,
      tags: entry.tags || [],
      created_at: entry.createdAt,
    })

    if (error) {
      console.warn('Supabase upsert error:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Network error during Supabase upsert:', err)
    return false
  }
}

/**
 * Seed or batch upsert entries to Supabase
 */
export async function upsertRemoteEntries(entries: JournalEntry[]): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client || entries.length === 0) return false

  try {
    const payload = entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle || null,
      content: entry.content,
      date: entry.date,
      mood: entry.mood || null,
      category: entry.category || null,
      collection: entry.collection || null,
      sort_order: entry.sort_order ?? null,
      tags: entry.tags || [],
      created_at: entry.createdAt,
    }))

    const { error } = await client.from('journal_entries').upsert(payload)
    if (error) {
      console.warn('Supabase batch upsert error:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Network error during batch upsert:', err)
    return false
  }
}

/**
 * Delete an entry from Supabase
 */
export async function deleteRemoteEntry(id: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false

  try {
    const { error } = await client.from('journal_entries').delete().eq('id', id)
    if (error) {
      console.warn('Supabase delete error:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Network error during Supabase delete:', err)
    return false
  }
}

/**
 * Subscribe to Supabase Realtime changes on `journal_entries` table.
 * Calls `onRemoteChange` whenever a change is detected.
 */
export function subscribeToRemoteEntries(onRemoteChange: () => void): () => void {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const channel = client
    .channel('web_journal_entries_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'journal_entries' },
      () => {
        onRemoteChange()
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

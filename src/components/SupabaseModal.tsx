import React, { useState, useEffect } from 'react'
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  fetchRemoteEntries,
  upsertRemoteEntries,
} from '../services/supabase'
import type { JournalEntry } from '../types'

interface SupabaseModalProps {
  isOpen: boolean
  onClose: () => void
  entries: JournalEntry[]
  onSyncComplete: (entries: JournalEntry[]) => void
}

const SQL_SCHEMA = `-- 1. Create table for journal entries
create table if not exists public.journal_entries (
    id text primary key,
    title text not null,
    subtitle text,
    content text not null,
    date text not null,
    mood text,
    category text,
    collection text,
    sort_order integer,
    tags text[] default '{}',
    created_at bigint not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS)
alter table public.journal_entries enable row level security;

-- 3. Create policies for public access (anon key)
create policy "Allow public read access"
on public.journal_entries for select
to anon, authenticated
using (true);

create policy "Allow public insert access"
on public.journal_entries for insert
to anon, authenticated
with check (true);

create policy "Allow public update access"
on public.journal_entries for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete access"
on public.journal_entries for delete
to anon, authenticated
using (true);

-- 4. Enable real-time updates
alter publication supabase_realtime add table public.journal_entries;`

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSyncComplete,
}) => {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials()
      setUrl(creds.url)
      setAnonKey(creds.anonKey)
      setStatusMsg(
        isSupabaseConfigured()
          ? 'Cloud sync is configured.'
          : 'Operating in local offline mode.'
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSaveAndSync = async () => {
    setIsLoading(true)
    setStatusMsg('Testing connection and syncing...')

    saveSupabaseCredentials(url, anonKey)

    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      setStatusMsg('Please provide a valid Supabase Project URL and Anon Key.')
      return
    }

    try {
      const remote = await fetchRemoteEntries()
      if (remote === null) {
        setStatusMsg('Connection failed. Please check your credentials and SQL schema.')
        setIsLoading(false)
        return
      }

      if (remote.length === 0 && entries.length > 0) {
        // Seed cloud with local entries
        setStatusMsg(`Seeding cloud with ${entries.length} local entries...`)
        await upsertRemoteEntries(entries)
        setStatusMsg(`Seeded ${entries.length} entries to cloud!`)
      } else {
        // Merge remote and local
        const map = new Map<string, JournalEntry>()
        entries.forEach((e) => map.set(e.id, e))
        remote.forEach((e) => map.set(e.id, e))
        const merged = Array.from(map.values())
        onSyncComplete(merged)
        setStatusMsg(`Sync successful! (${merged.length} entries in sync)`)
      }
    } catch (err: any) {
      setStatusMsg(`Sync error: ${err.message || err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForcePush = async () => {
    setIsLoading(true)
    setStatusMsg(`Pushing all ${entries.length} local entries to cloud...`)
    const success = await upsertRemoteEntries(entries)
    if (success) {
      setStatusMsg(`Successfully uploaded all ${entries.length} entries to cloud!`)
    } else {
      setStatusMsg('Failed to push entries. Check connection.')
    }
    setIsLoading(false)
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] dark:bg-[#141517] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="text-xl font-serif-title font-medium text-stone-900 dark:text-stone-100">
              Cloud Sync & Mobile Connection
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono-meta mt-0.5">
              Sync in real time with Vercel and Flutter Mobile
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status notification */}
        {statusMsg && (
          <div className="mt-4 p-3 rounded-lg text-xs font-mono-meta bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {statusMsg}
          </div>
        )}

        {/* Form fields */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono-meta uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1A1C1E] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono-meta"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-meta uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
              Anon / Public API Key
            </label>
            <textarea
              rows={2}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1A1C1E] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono-meta"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSaveAndSync}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Save & Sync'}
            </button>
            <button
              onClick={handleForcePush}
              disabled={isLoading || !isSupabaseConfigured()}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              title="Push all 20 local entries into Supabase"
            >
              Push to Cloud
            </button>
          </div>
        </div>

        {/* SQL Schema Instructions */}
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-meta uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Supabase SQL Schema
            </span>
            <button
              onClick={handleCopySql}
              className="text-xs font-mono-meta text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 underline cursor-pointer"
            >
              {copiedSql ? '✓ Copied!' : 'Copy SQL'}
            </button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
            Run this in your Supabase project's SQL Editor to create the table and enable real-time sync:
          </p>
          <pre className="p-3 bg-stone-100 dark:bg-[#0E0F10] border border-stone-200 dark:border-stone-800 rounded-lg text-[11px] font-mono leading-relaxed text-stone-700 dark:text-stone-300 overflow-x-auto max-h-36">
            {SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  )
}

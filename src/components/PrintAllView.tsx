import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { JournalEntry } from '../types'
import { MISSION_2027_COLLECTION } from '../types'

interface PrintAllViewProps {
  entries: JournalEntry[]
  userName: string
}

export const PrintAllView: React.FC<PrintAllViewProps> = ({ entries, userName }) => {
  return (
    <div className="hidden print:block w-full text-black font-serif">
      {/* Book Title Page */}
      <div className="py-20 text-center border-b-2 border-stone-800 print-page-break">
        <div className="text-xs font-mono-meta uppercase tracking-widest text-stone-500 mb-4">
          Personal Journal • {MISSION_2027_COLLECTION.startingDate}
        </div>
        <h1 className="text-5xl font-serif-title font-bold text-black mb-4">
          {MISSION_2027_COLLECTION.name}
        </h1>
        <p className="text-2xl italic text-stone-700 max-w-xl mx-auto leading-relaxed">
          &ldquo;{MISSION_2027_COLLECTION.subtitle}&rdquo;
        </p>
        <div className="mt-12 text-sm font-mono-meta text-stone-600">
          Written by {userName} • {entries.length} Reflections
        </div>
      </div>

      {/* Table of Contents */}
      <div className="py-12 border-b border-stone-400 print-page-break">
        <h2 className="text-2xl font-serif-title font-bold text-black mb-6 uppercase tracking-wider">
          Table of Contents
        </h2>
        <div className="space-y-3 font-mono-meta text-sm">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="flex items-center justify-between border-b border-dotted border-stone-300 pb-1">
              <span>
                §{String(idx + 1).padStart(2, '0')}. {entry.title}
              </span>
              <span className="text-xs text-stone-500">
                {entry.category} {entry.mood ? `• ${entry.mood}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All Entries Sequentially */}
      {entries.map((entry, idx) => {
        const isMalayalam = /[\u0D00-\u0D7F]/.test(entry.content)
        return (
          <article key={entry.id} className="py-8 print-page-break">
            <header className="border-b border-stone-800 pb-4 mb-6">
              <div className="text-xs font-mono-meta uppercase tracking-wider text-stone-500 mb-1">
                Reflection #{String(idx + 1).padStart(2, '0')} • {entry.date} • {entry.category}
                {entry.mood ? ` • Mood: ${entry.mood}` : ''}
              </div>
              <h2 className="text-3xl font-serif-title font-bold text-black">
                {entry.title}
              </h2>
              {entry.subtitle && (
                <p className="text-lg italic text-stone-700 mt-1">
                  &ldquo;{entry.subtitle}&rdquo;
                </p>
              )}
            </header>

            <div className={`prose max-w-none text-black leading-relaxed ${isMalayalam ? 'font-malayalam' : ''}`}>
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-serif-title font-bold mt-8 mb-3 pb-1 border-b border-stone-300 text-black">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-serif-title font-semibold mt-6 mb-2 text-black">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-base leading-relaxed my-3 text-stone-900 font-light">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-black">
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="pl-4 border-l-2 border-stone-600 italic my-4 text-stone-800">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {entry.content}
              </ReactMarkdown>
            </div>
          </article>
        )
      })}
    </div>
  )
}

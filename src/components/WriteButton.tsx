import React from 'react'

interface WriteButtonProps {
  onClick: () => void
}

export const WriteButton: React.FC<WriteButtonProps> = ({ onClick }) => {
  return (
    <div className="my-6">
      <button
        onClick={onClick}
        className="w-full text-left py-5 px-6 rounded-xl border border-stone-300/80 dark:border-stone-800 
                   bg-stone-50/60 dark:bg-stone-900/40 hover:bg-stone-100/80 dark:hover:bg-stone-850/80 
                   hover:border-stone-400 dark:hover:border-stone-700
                   transition-all duration-200 cursor-pointer group flex items-center justify-between shadow-xs"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-mono-meta text-base font-normal">
            <span className="text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors text-lg font-light">
              +
            </span>
            <span className="tracking-wide font-medium">write something</span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-serif italic pl-6">
            open full-page distraction-free studio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-meta text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-800 px-2 py-1 rounded-md bg-stone-100/50 dark:bg-stone-800/50">
            press N
          </span>
        </div>
      </button>
    </div>
  )
}

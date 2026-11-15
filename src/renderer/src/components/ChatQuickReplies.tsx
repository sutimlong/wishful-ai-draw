import React from 'react'
import { CornerDownRight } from 'lucide-react'

interface ChatQuickRepliesProps {
  replies?: string[]
  disabled?: boolean
  onSelect: (reply: string) => void
}

/**
 * 顯示在 DeepSeek 回覆下方的情境化快速回覆按鈕。
 * 點擊後直接以該文字送出，不需要再手動輸入。
 */
export const ChatQuickReplies: React.FC<ChatQuickRepliesProps> = ({
  replies,
  disabled = false,
  onSelect
}) => {
  if (!replies || replies.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-0.5" aria-label="快速回覆">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          title={`點擊直接送出：${reply}`}
          className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/20 active:scale-[0.99] disabled:cursor-default disabled:opacity-40"
        >
          <CornerDownRight className="h-3 w-3 shrink-0 text-indigo-300" />
          {reply}
        </button>
      ))}
    </div>
  )
}

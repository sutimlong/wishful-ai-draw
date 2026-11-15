import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Eye,
  Images,
  Loader2,
  Paperclip,
  Play,
  Send,
  Trash2,
  User,
  X
} from 'lucide-react'
import {
  FAL_IMAGE_TO_VIDEO_MODELS,
  STARRED_IMAGE_TO_VIDEO_IDS
} from '../../../shared/falImageToVideoModels'
import {
  FAL_TEXT_TO_VIDEO_MODELS,
  STARRED_TEXT_TO_VIDEO_IDS
} from '../../../shared/falTextToVideoModels'
import type {
  FalModelPreset,
  TextToImageChatAttachment,
  TextToVideoAspect,
  TextToVideoFileEntry,
  TextToVideoGeneratedVideo
} from '../../../shared/types'
import { formatUsd } from '../utils/cost'
import { shouldApplySuggestedModel } from '../utils/modelSwitchIntent'
import { MAX_REFERENCE_IMAGES } from '../utils/textToImageOptions'
import { formatElectronIpcError } from '../utils/textToVideoOptions'
import { ChatSuggestedModelsBar } from './ChatSuggestedModelsBar'
import { ChatQuickReplies } from './ChatQuickReplies'
import { TextToVideoSettingsFields, type VideoSettingsModeKind } from './TextToVideoSettingsFields'

interface TextToVideoChatProps {
  /** 目前是否顯示對話模式（用於切換回來時自動捲到底部） */
  isActive: boolean
  /** 文生影片或圖生影片模式（影響歡迎文案、模型清單與 IPC 通道） */
  modeKind?: VideoSettingsModeKind
  models?: FalModelPreset[]
  starredIds?: Iterable<string>
  endpointId: string
  onEndpointIdChange: (endpointId: string) => void
  aspectId: TextToVideoAspect
  onAspectIdChange: (aspectId: TextToVideoAspect) => void
  durationSeconds: number
  onDurationSecondsChange: (seconds: number) => void
  resolution: string
  onResolutionChange: (resolution: string) => void
  generateAudio: boolean
  onGenerateAudioChange: (enabled: boolean) => void
  selectedModel?: FalModelPreset
  onVideosGenerated: () => void | Promise<void>
  onPreviewVideo: (video: TextToVideoFileEntry) => void
}

interface ChatAttachment extends TextToImageChatAttachment {
  id: string
  previewUrl: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: ChatAttachment[]
  videos?: TextToVideoGeneratedVideo[]
  modelName?: string
  prompt?: string
  costUsd?: number
  costIsEstimated?: boolean
  suggestedModelId?: string
  suggestedModelIds?: string[]
  quickReplies?: string[]
  isError?: boolean
}

const CHAT_SUGGESTIONS = [
  '幫我構想一段電影感的城市雨夜霓虹短片',
  '我想做產品形象宣傳片，請推薦適合的影片模型',
  '我上傳了參考圖，想延伸成流暢的動態鏡頭'
]

const IMAGE_TO_VIDEO_CHAT_SUGGESTIONS = [
  '幫這張照片設計一段自然的人物動態與慢推鏡頭',
  '我有首幀和尾幀兩張圖片，請推薦適合轉場生成的模型',
  '我想讓商品圖在畫面中輕微旋轉並加入電影感光影'
]

function createChatId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function localMediaUrl(filePath: string): string {
  return `local-media://image?path=${encodeURIComponent(filePath)}`
}

function fileNameFromPath(filePath: string): string {
  return filePath.split(/[/\\]/).pop() || 'text2vid.mp4'
}

/** 把 fal.ai 生成結果轉成頁面 Lightbox 可接受的格式 */
function toPreviewEntry(video: TextToVideoGeneratedVideo): TextToVideoFileEntry {
  if (video.savedFilePath) {
    return {
      filePath: video.savedFilePath,
      url: localMediaUrl(video.savedFilePath),
      fileName: fileNameFromPath(video.savedFilePath),
      modifiedAt: Date.now()
    }
  }
  return {
    filePath: video.url,
    url: video.url,
    fileName: 'text2vid.mp4',
    modifiedAt: Date.now()
  }
}

const AssistantAvatar: React.FC = () => (
  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-950/40">
    <Bot className="h-4 w-4" />
  </div>
)

const UserAvatar: React.FC = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300">
    <User className="h-3.5 w-3.5" />
  </div>
)

/**
 * 影片生成對話模式（支援文字生成影片與圖片生成影片）：
 * DeepSeek Flash 負責討論、看圖與挑選模型，主程序在必要時直接交接 fal.ai 生成。
 */
export const TextToVideoChat: React.FC<TextToVideoChatProps> = ({
  isActive,
  modeKind = 'text-to-video',
  models,
  starredIds,
  endpointId,
  onEndpointIdChange,
  aspectId,
  onAspectIdChange,
  durationSeconds,
  onDurationSecondsChange,
  resolution,
  onResolutionChange,
  generateAudio,
  onGenerateAudioChange,
  selectedModel,
  onVideosGenerated,
  onPreviewVideo
}) => {
  const isImageToVideo = modeKind === 'image-to-video'
  const resolvedModels =
    models ?? (isImageToVideo ? FAL_IMAGE_TO_VIDEO_MODELS : FAL_TEXT_TO_VIDEO_MODELS)
  const resolvedStarredIds =
    starredIds ?? (isImageToVideo ? STARRED_IMAGE_TO_VIDEO_IDS : STARRED_TEXT_TO_VIDEO_IDS)
  const suggestions = isImageToVideo ? IMAGE_TO_VIDEO_CHAT_SUGGESTIONS : CHAT_SUGGESTIONS

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [draftAttachments, setDraftAttachments] = useState<ChatAttachment[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 新訊息、等待回覆或切回對話模式時自動捲到底部
  useEffect(() => {
    if (!isActive) return
    const element = scrollRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
  }, [messages, isSending, error, isActive])

  const conversationReferenceCount = useMemo(() => {
    const paths = new Set<string>()
    for (const message of messages) {
      for (const attachment of message.attachments ?? []) {
        if (attachment.asReference) paths.add(attachment.filePath)
      }
    }
    return paths.size
  }, [messages])

  const draftReferenceCount = draftAttachments.filter((item) => item.asReference).length
  const referenceUnsupported =
    !isImageToVideo && draftReferenceCount > 0 && !selectedModel?.referenceImageField
  const canSend = !isSending && (input.trim().length > 0 || draftAttachments.length > 0)

  const handleAttach = async (): Promise<void> => {
    if (isSending) return
    const items = await window.electronAPI.selectReferenceImages()
    if (items.length === 0) return

    setDraftAttachments((previous) => {
      const merged = [...previous]
      for (const item of items) {
        if (merged.some((existing) => existing.filePath === item.sourceFilePath)) continue
        if (merged.length >= MAX_REFERENCE_IMAGES) break
        merged.push({
          id: createChatId(),
          filePath: item.sourceFilePath,
          fileName: item.sourceFileName,
          previewUrl: item.sourcePreviewUrl,
          forVision: true,
          asReference: true
        })
      }
      return merged
    })
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const updateAttachment = (
    id: string,
    patch: Partial<Pick<ChatAttachment, 'forVision' | 'asReference'>>
  ): void => {
    setDraftAttachments((previous) =>
      previous.map((attachment) =>
        attachment.id === id ? { ...attachment, ...patch } : attachment
      )
    )
  }

  const removeAttachment = (id: string): void => {
    setDraftAttachments((previous) => previous.filter((attachment) => attachment.id !== id))
  }

  const handleClear = (): void => {
    if (isSending) return
    setMessages([])
    setDraftAttachments([])
    setInput('')
    setError(null)
  }

  const handleSend = async (overrideText?: string): Promise<void> => {
    const text = (overrideText ?? input).trim()
    if (isSending || (!text && draftAttachments.length === 0)) return

    const userMessage: ChatMessage = {
      id: createChatId(),
      role: 'user',
      content: text,
      attachments: draftAttachments.length > 0 ? draftAttachments : undefined
    }
    const history = [...messages, userMessage]

    setMessages(history)
    setInput('')
    setDraftAttachments([])
    setError(null)
    setIsSending(true)

    try {
      const chatPayload = {
        messages: history
          .filter((message) => !message.isError)
          .map((message) => ({
            role: message.role,
            content:
              message.content +
              (message.suggestedModelIds && message.suggestedModelIds.length > 0
                ? `\n（先前建議模型：${message.suggestedModelIds.join('、')}）`
                : message.suggestedModelId
                  ? `\n（先前建議模型：${message.suggestedModelId}）`
                  : '') +
              (message.videos && message.videos.length > 0
                ? `\n（先前已生成 ${message.videos.length} 支影片${
                    message.modelName ? `，使用 ${message.modelName}` : ''
                  }）`
                : ''),
            attachments: message.attachments?.map((attachment) => ({
              filePath: attachment.filePath,
              fileName: attachment.fileName,
              forVision: attachment.forVision,
              asReference: attachment.asReference
            }))
          })),
        endpointId,
        aspectId,
        durationSeconds,
        resolution,
        generateAudio
      }
      const result = isImageToVideo
        ? await window.electronAPI.chatImageToVideo(chatPayload)
        : await window.electronAPI.chatTextToVideo(chatPayload)

      if (!result.ok) {
        setError(result.message)
        setMessages((previous) => [
          ...previous,
          {
            id: createChatId(),
            role: 'assistant',
            content: `⚠️ ${result.message}`,
            isError: true
          }
        ])
        return
      }

      if (result.action === 'generate') {
        if (result.modelId !== endpointId) {
          onEndpointIdChange(result.modelId)
        }
        setMessages((previous) => [
          ...previous,
          {
            id: createChatId(),
            role: 'assistant',
            content: result.reply,
            videos: result.videos,
            modelName: result.modelName,
            prompt: result.prompt,
            costUsd: result.costUsd,
            costIsEstimated: result.costIsEstimated,
            quickReplies: result.quickReplies
          }
        ])
        try {
          await onVideosGenerated()
        } catch (refreshErr) {
          console.error('重新讀取生成結果失敗：', refreshErr)
        }
        return
      }

      if (
        shouldApplySuggestedModel({
          currentEndpointId: endpointId,
          suggestedModelId: result.suggestedModelId,
          applyModelChange: result.applyModelChange,
          userText: text
        }) &&
        result.suggestedModelId
      ) {
        onEndpointIdChange(result.suggestedModelId)
      }

      setMessages((previous) => [
        ...previous,
        {
          id: createChatId(),
          role: 'assistant',
          content: result.reply,
          suggestedModelId: result.suggestedModelId,
          suggestedModelIds: result.suggestedModelIds,
          quickReplies: result.quickReplies
        }
      ])
    } catch (err) {
      const message = formatElectronIpcError(err, '對話失敗，請稍後再試')
      setError(message)
      setMessages((previous) => [
        ...previous,
        {
          id: createChatId(),
          role: 'assistant',
          content: `⚠️ ${message}`,
          isError: true
        }
      ])
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestion = (suggestion: string): void => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ChatGPT 風格對話面板 */}
      <section className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 lg:h-[calc(100vh-250px)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <AssistantAvatar />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                DeepSeek 對話
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-medium text-sky-300">
                  deepseek-flash
                </span>
              </div>
              <p className="truncate text-[10px] text-zinc-500">
                支援看圖 · 討論模型與運鏡提示詞 · 確認後交給 fal.ai 生成
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            disabled={
              (messages.length === 0 && draftAttachments.length === 0 && !input.trim()) ||
              isSending
            }
            title="清除對話與附件"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300 disabled:cursor-default disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清除
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 select-text">
          {messages.length === 0 && !isSending ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/15 text-indigo-300">
                <Bot className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {isImageToVideo ? '和 DeepSeek 一起讓圖片動起來' : '和 DeepSeek 一起完成影片'}
              </h3>
              <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-zinc-500">
                {isImageToVideo
                  ? '上傳來源圖片並描述動態與運鏡想法，DeepSeek 會協助構思英文提示詞、推薦 fal.ai 圖生影片模型，確認後直接交接生成。'
                  : '描述你的想法、上傳參考圖，DeepSeek 會協助釐清畫面與運鏡、選擇 fal.ai 影片模型；當需求明確時，它會直接交接生影片任務並把結果帶回對話。'}
              </p>
              <div className="mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-left text-[11px] leading-relaxed text-zinc-400 transition hover:border-indigo-500/40 hover:text-indigo-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id} className="flex justify-end gap-2.5">
                    <div className="flex max-w-[85%] flex-col items-end gap-2">
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              title={attachment.fileName}
                              className="relative h-20 w-20 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"
                            >
                              <img
                                src={attachment.previewUrl}
                                alt={attachment.fileName}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/90 to-transparent px-1 pb-1 pt-3 text-[8px] font-medium text-zinc-200">
                                {attachment.forVision && (
                                  <span className="rounded bg-sky-500/70 px-1">看圖</span>
                                )}
                                {attachment.asReference && (
                                  <span className="rounded bg-indigo-500/70 px-1">參考</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {message.content && (
                        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-indigo-600 px-3.5 py-2.5 text-sm leading-relaxed text-white select-text">
                          {message.content}
                        </div>
                      )}
                    </div>
                    <UserAvatar />
                  </div>
                )
              }

              return (
                <div key={message.id} className="flex gap-2.5">
                  <AssistantAvatar />
                  <div className="min-w-0 max-w-[85%] space-y-2">
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border px-3.5 py-2.5 text-sm leading-relaxed select-text ${
                        message.isError
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                          : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.videos && message.videos.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {message.videos.map((video, index) => {
                            const entry = toPreviewEntry(video)
                            return (
                              <button
                                key={`${entry.filePath}-${index}`}
                                onClick={() => onPreviewVideo(entry)}
                                title="點擊放大播放"
                                className="group relative aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-black"
                              >
                                <video
                                  src={entry.url}
                                  preload="metadata"
                                  muted
                                  className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white shadow">
                                    <Play className="h-4 w-4 fill-white" />
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-[10px] text-zinc-600">
                          已自動儲存至「{isImageToVideo ? '圖生影片' : '文生影片'}」資料夾
                        </p>
                      </>
                    )}

                    {(message.modelName || message.costUsd !== undefined) && (
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                        {message.modelName && (
                          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-indigo-300">
                            fal.ai · {message.modelName}
                          </span>
                        )}
                        {message.costUsd !== undefined && (
                          <span>
                            本次費用：{formatUsd(message.costUsd)}
                            {message.costIsEstimated ? '（預估）' : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {message.prompt && (
                      <details className="text-[10px] text-zinc-600">
                        <summary className="cursor-pointer transition hover:text-zinc-400">
                          查看交給 fal.ai 的提示詞
                        </summary>
                        <p className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 font-mono text-[10px] leading-relaxed text-zinc-500 select-text">
                          {message.prompt}
                        </p>
                      </details>
                    )}

                    <ChatSuggestedModelsBar
                      suggestedModelId={message.suggestedModelId}
                      suggestedModelIds={message.suggestedModelIds}
                      models={resolvedModels}
                      currentEndpointId={endpointId}
                      onSelectModel={onEndpointIdChange}
                    />

                    <ChatQuickReplies
                      replies={message.quickReplies}
                      disabled={isSending}
                      onSelect={(reply) => {
                        void handleSend(reply)
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}

          {isSending && (
            <div className="flex gap-2.5">
              <AssistantAvatar />
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-950/80 px-3.5 py-3 text-xs text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                DeepSeek 正在思考，必要時會交給 fal.ai 生成影片（約 30~120 秒）…
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-zinc-800 bg-zinc-950/60 p-3">
          {draftAttachments.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {draftAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="w-32 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1.5"
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-lg bg-zinc-950">
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.fileName}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      title="移除圖片"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-zinc-300 transition hover:bg-rose-500/80 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="mt-1 truncate text-[9px] text-zinc-500" title={attachment.fileName}>
                    {attachment.fileName}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <button
                      onClick={() =>
                        updateAttachment(attachment.id, { forVision: !attachment.forVision })
                      }
                      aria-pressed={attachment.forVision}
                      title="讓 DeepSeek 看這張圖"
                      className={`flex items-center justify-center gap-0.5 rounded-md border px-1 py-0.5 text-[9px] transition ${
                        attachment.forVision
                          ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Eye className="h-2.5 w-2.5" />
                      看圖
                    </button>
                    <button
                      onClick={() =>
                        updateAttachment(attachment.id, { asReference: !attachment.asReference })
                      }
                      aria-pressed={attachment.asReference}
                      title="作為 fal.ai 生成參考圖"
                      className={`flex items-center justify-center gap-0.5 rounded-md border px-1 py-0.5 text-[9px] transition ${
                        attachment.asReference
                          ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Images className="h-2.5 w-2.5" />
                      參考
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {referenceUnsupported && (
            <p className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] leading-relaxed text-amber-300">
              目前模型不支援參考圖；DeepSeek 可能會改用支援的模型，或你可以關閉圖片的「參考」。
            </p>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-indigo-500/60">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              rows={2}
              disabled={isSending}
              placeholder={
                isImageToVideo
                  ? '上傳來源圖片後描述想呈現的動作與運鏡，或問 DeepSeek 哪個圖生影片模型適合…'
                  : '描述你想生成的影片畫面與運鏡，或問 DeepSeek 哪個模型適合…'
              }
              className="max-h-40 w-full resize-none select-text bg-transparent px-1.5 py-1 text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 outline-none disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5 pt-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <button
                  onClick={handleAttach}
                  disabled={isSending}
                  title="上傳圖片（可設為看圖或生成參考）"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400 transition hover:border-indigo-500/40 hover:text-indigo-200 disabled:cursor-default disabled:opacity-40"
                >
                  <Paperclip className="h-3 w-3" />
                  上傳圖片
                </button>
                <span className="truncate text-[10px] text-zinc-600">
                  模型：{selectedModel?.name ?? '—'}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-[10px] text-zinc-600 sm:inline">
                  Enter 送出 · Shift+Enter 換行
                </span>
                <button
                  onClick={() => {
                    void handleSend()
                  }}
                  disabled={!canSend}
                  title={canSend ? '送出對話' : '請輸入訊息或上傳圖片'}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                    canSend
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                      : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] text-rose-300">
              {error}
            </p>
          )}
          <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-600">
            DeepSeek 判斷需求明確時會自動選擇模型並交給 fal.ai 生成，會產生 fal.ai 費用。
          </p>
        </div>
      </section>

      {/* 右側：模型與生成參數 */}
      <aside className="space-y-4 self-start rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          模型與生成參數
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          你可以先指定模型，或直接告訴 DeepSeek 需求讓它推薦。生成時會使用這裡的比例、秒數、畫質與音效設定。
        </p>

        <TextToVideoSettingsFields
          idPrefix={isImageToVideo ? 'image-to-video-chat' : 'text-to-video-chat'}
          modeKind={modeKind}
          models={resolvedModels}
          starredIds={resolvedStarredIds}
          endpointId={endpointId}
          onEndpointIdChange={onEndpointIdChange}
          aspectId={aspectId}
          onAspectIdChange={onAspectIdChange}
          durationSeconds={durationSeconds}
          onDurationSecondsChange={onDurationSecondsChange}
          resolution={resolution}
          onResolutionChange={onResolutionChange}
          generateAudio={generateAudio}
          onGenerateAudioChange={onGenerateAudioChange}
          selectedModel={selectedModel}
        />

        <div className="space-y-1.5 border-t border-zinc-800/80 pt-3 text-[11px]">
          {isImageToVideo ? (
            <>
              <p className="text-emerald-300">
                目前模型：
                {selectedModel?.isArrayImageInput
                  ? '支援多張來源參考圖'
                  : selectedModel?.requiresEndImage
                    ? '需首幀＋尾幀 2 張圖片'
                    : selectedModel?.endImageField
                      ? '單張首幀（可選第 2 張尾幀）'
                      : '單張來源圖片'}
              </p>
              <p className="text-zinc-500">對話中的來源圖片：{conversationReferenceCount} 張</p>
              {conversationReferenceCount === 0 && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-relaxed text-amber-300">
                  圖生影片需至少提供 1 張標記「參考」的圖片；請在對話中上傳圖片並保持開啟「參考」。
                </p>
              )}
              {selectedModel?.requiresEndImage && conversationReferenceCount === 1 && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-relaxed text-amber-300">
                  此模型需同時提供首幀與尾幀共 2 張「參考」圖片才能生成。
                </p>
              )}
            </>
          ) : (
            <>
              <p className={selectedModel?.referenceImageField ? 'text-emerald-300' : 'text-zinc-500'}>
                目前模型：{selectedModel?.referenceImageField ? '支援參考圖' : '不支援參考圖'}
                {selectedModel?.isArrayReferenceImage ? '（可多張）' : ''}
              </p>
              <p className="text-zinc-500">對話中的生成參考圖：{conversationReferenceCount} 張</p>
              {selectedModel?.requiresReferenceImage && conversationReferenceCount === 0 && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-relaxed text-amber-300">
                  此模型必須提供參考圖才能生成；請在對話中上傳圖片並開啟「參考」。
                </p>
              )}
              {conversationReferenceCount > 0 && !selectedModel?.referenceImageField && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-relaxed text-amber-300">
                  目前模型不支援參考圖；生成時 DeepSeek 會嘗試改用支援參考圖的模型。
                </p>
              )}
            </>
          )}
          <p className="text-zinc-600">
            AI 看圖會使用最近 6 張標記「看圖」的圖片；生成參考圖最多使用 {MAX_REFERENCE_IMAGES}{' '}
            張。
          </p>
          <p className="text-zinc-600">
            DeepSeek 可依討論內容切換模型，切換後會同步更新右側選單。
          </p>
        </div>
      </aside>
    </div>
  )
}

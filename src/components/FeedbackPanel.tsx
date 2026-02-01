'use client'

interface FeedbackPanelProps {
  feedback: string
  onClose: () => void
  onNewSession: () => void
}

export default function FeedbackPanel({
  feedback,
  onClose,
  onNewSession,
}: FeedbackPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="pixel-panel max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <h2 className="text-pixel-gold text-lg mb-4 text-center font-bold">
          📊 对话习惯分析报告
        </h2>
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap mb-6 text-gray-200">
          {feedback}
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            className="pixel-btn pixel-btn-purple text-sm py-2 px-4"
            onClick={onClose}
          >
            继续对话
          </button>
          <button
            className="pixel-btn pixel-btn-gold text-sm py-2 px-4"
            onClick={onNewSession}
          >
            新场景
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          每一次对话都是自我发现的旅程 ✨
        </p>
      </div>
    </div>
  )
}

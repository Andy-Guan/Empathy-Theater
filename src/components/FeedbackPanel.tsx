'use client'

import { useState, useEffect, useRef } from 'react'

interface FeedbackPanelProps {
  feedback: string
  isLoading?: boolean
  onClose: () => void
  onNewSession: () => void
}

export default function FeedbackPanel({
  feedback,
  isLoading = false,
  onClose,
  onNewSession,
}: FeedbackPanelProps) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentLength, setCurrentLength] = useState(0)
  const typingRef = useRef<number | null>(null)
  const prevFeedbackRef = useRef('')

  // 打字机效果 - 处理反馈内容更新
  useEffect(() => {
    // 如果正在加载或内容为空/加载中，保持状态
    if (isLoading || !feedback || feedback === '分析中...') {
      if (feedback === '分析中...') {
        setDisplayText(feedback)
        setIsTyping(false)
      }
      prevFeedbackRef.current = feedback
      return
    }

    // 如果内容没变，跳过
    if (feedback === prevFeedbackRef.current) {
      return
    }

    prevFeedbackRef.current = feedback
    const targetLength = feedback.length

    // 清除之前的定时器
    if (typingRef.current !== null) {
      clearInterval(typingRef.current)
      typingRef.current = null
    }

    // 如果新内容比当前显示的短，可能是重置
    if (targetLength < currentLength) {
      setDisplayText(feedback)
      setCurrentLength(targetLength)
      setIsTyping(false)
      return
    }

    setIsTyping(true)

    // 开始打字机效果，从当前位置继续
    const startFrom = currentLength
    let index = startFrom

    typingRef.current = window.setInterval(() => {
      if (index < targetLength) {
        setDisplayText(feedback.slice(0, index + 1))
        setCurrentLength(index + 1)
        index++
      } else {
        setIsTyping(false)
        if (typingRef.current !== null) {
          clearInterval(typingRef.current)
          typingRef.current = null
        }
      }
    }, 20)  // 每 20ms 打出一个字符

    return () => {
      if (typingRef.current !== null) {
        clearInterval(typingRef.current)
      }
    }
  }, [feedback, isLoading, currentLength])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (typingRef.current !== null) {
        clearInterval(typingRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="pixel-panel max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <h2 className="text-pixel-gold text-lg mb-4 text-center font-bold">
          {isLoading ? '📋 正在分析...' : '📋 对话习惯分析报告'}
        </h2>
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap mb-6 text-gray-200 min-h-[200px]">
          {displayText || feedback || '正在生成分析报告...'}
          {isTyping && <span className="animate-pulse">▌</span>}
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            className="pixel-btn pixel-btn-purple text-sm py-2 px-4"
            onClick={onClose}
            disabled={isLoading || isTyping}
          >
            继续对话
          </button>
          <button
            className="pixel-btn pixel-btn-gold text-sm py-2 px-4"
            onClick={onNewSession}
            disabled={isLoading || isTyping}
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

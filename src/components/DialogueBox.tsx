'use client'

import { useState, useEffect } from 'react'
import { NPC, Message } from '@/store/useStore'

interface DialogueBoxProps {
  currentMessage: Message | null
  currentNpc: NPC | null
  isTyping: boolean
  typingNpcName: string | null
  inputValue: string
  onInputChange: (value: string) => void
  onSend: (content: string) => void
  disabled: boolean
  placeholder: string
  mode: 'normal' | 'reversed'
}

export default function DialogueBox({
  currentMessage,
  currentNpc,
  isTyping,
  typingNpcName,
  inputValue,
  onInputChange,
  onSend,
  disabled,
  placeholder,
  mode,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  
  // 提取消息内容（去除[角色名]前缀）
  const getMessageContent = (content: string): string => {
    const match = content.match(/^\[([^\]]+)\]\s*(.*)$/s)
    return match ? match[2] : content
  }

  // 打字机效果
  useEffect(() => {
    if (!currentMessage) {
      setDisplayedText('')
      return
    }

    const content = getMessageContent(currentMessage.content)
    
    if (currentMessage.isStreaming) {
      // 流式输出时直接显示
      setDisplayedText(content)
    } else {
      // 完成后显示完整内容
      setDisplayedText(content)
    }
  }, [currentMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      if (inputValue.trim()) {
        onSend(inputValue)
      }
    }
  }

  // 获取发言者信息
  const getSpeakerInfo = () => {
    if (isTyping && typingNpcName) {
      return { name: typingNpcName, isTyping: true }
    }
    if (currentMessage) {
      if (currentMessage.role === 'user') {
        return { name: '你', isUser: true }
      }
      if (currentMessage.role === 'reversed-user') {
        return { name: '你（AI模拟）', isReversed: true }
      }
      if (currentMessage.role === 'npc' && currentNpc) {
        return { name: `${currentNpc.name}（${currentNpc.title}）`, isNpc: true }
      }
    }
    return null
  }

  const speaker = getSpeakerInfo()

  return (
    <div className="dialogue-box">
      {/* 发言者名字 */}
      <div className="dialogue-speaker">
        {speaker && (
          <span className={`dialogue-speaker-name ${
            speaker.isUser ? 'text-pixel-cyan' : 
            speaker.isReversed ? 'text-pixel-purple' : 
            'text-pixel-coral'
          }`}>
            {speaker.name}
            {speaker.isTyping && <span className="ml-2 animate-pulse">...</span>}
          </span>
        )}
      </div>

      {/* 对话内容区域 */}
      <div className="dialogue-content">
        {isTyping ? (
          <div className="dialogue-text">
            {displayedText || (
              <span className="typing-indicator inline-flex">
                <span></span>
                <span></span>
                <span></span>
              </span>
            )}
          </div>
        ) : currentMessage ? (
          <div className="dialogue-text">
            {displayedText}
          </div>
        ) : (
          <div className="dialogue-text text-gray-500">
            等待对话开始...
          </div>
        )}
      </div>

      {/* 用户输入区域 */}
      <div className="dialogue-input-area">
        <input
          type="text"
          className="dialogue-input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          className="dialogue-send-btn"
          onClick={() => inputValue.trim() && onSend(inputValue)}
          disabled={disabled || !inputValue.trim()}
        >
          发送
        </button>
      </div>

      {/* 模式提示 */}
      {mode === 'reversed' && (
        <div className="dialogue-mode-hint">
          <span className="text-pixel-gold">👁️</span> 旁观模式
          <span className="text-xs text-gray-400 ml-2">[Ctrl+R 恢复控制]</span>
        </div>
      )}
    </div>
  )
}

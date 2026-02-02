'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { NPC, Message } from '@/store/useStore'
import ChatInput from './ChatInput'

interface DialogueBoxProps {
  currentMessage: Message | null
  currentNpc: NPC | null
  isTyping: boolean
  typingNpcName: string | null
  inputValue: string
  onInputChange: (value: string) => void
  onSend: (content: string) => void
  onDialogueClick?: () => void  // 添加对话框点击回调
  disabled: boolean
  placeholder: string
  mode: 'normal' | 'reversed'
  npcs?: Array<{ id: string; name: string; avatar: string }>
  selectedNpcId?: string | null
  onSelectNpc?: (npcId: string) => void
  hasSentFirstMessage?: boolean
}

export default function DialogueBox({
  currentMessage,
  currentNpc,
  isTyping,
  typingNpcName,
  inputValue,
  onInputChange,
  onSend,
  onDialogueClick,
  disabled,
  placeholder,
  mode,
  npcs = [],
  selectedNpcId = null,
  onSelectNpc,
  hasSentFirstMessage = false,
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

  // 获取发言者信息
  const getSpeakerInfo = () => {
    if (isTyping && typingNpcName) {
      return { name: typingNpcName, isTyping: true }
    }
    if (currentMessage) {
      if (currentMessage.role === 'user') {
        // 解析用户消息中的角色名
        const match = currentMessage.content.match(/^\[([^\]]+)\]/)
        if (match) {
          return { name: match[1], isUser: true }
        }
        return { name: '你', isUser: true }
      }
      if (currentMessage.role === 'reversed-user') {
        return { name: '你（AI模拟）', isReversed: true }
      }
      if (currentMessage.role === 'npc' && currentNpc) {
        return { name: `${currentNpc.name}（${currentNpc.title}）`, isNpc: true }
      }
      if (currentMessage.role === 'system') {
        return { name: '系统', isSystem: true }
      }
    }
    return null
  }

  const speaker = getSpeakerInfo()

  return (
    <div className="dialogue-box">
      {/* 发言者信息 */}
      {speaker && (
        <div className={`dialogue-speaker ${speaker.isTyping ? 'typing' : ''} ${speaker.isUser ? 'user-speaker' : ''} ${speaker.isReversed ? 'reversed-speaker' : ''}`}>
          <span className="speaker-name">{speaker.name}</span>
          {speaker.isTyping && <span className="typing-indicator inline-flex ml-2"><span></span><span></span><span></span></span>}
        </div>
      )}

      {/* 对话内容区域 - 可点击 */}
      <div 
        className={`dialogue-content ${onDialogueClick ? 'cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-2 -mx-2' : ''}`}
        onClick={onDialogueClick}
      >
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
            等待消息...
          </div>
        )}

        {/* 反转模式醒目的点击继续提示 */}
        {mode === 'reversed' && !isTyping && onDialogueClick && (
          <div className="mt-3 p-3 bg-gradient-to-r from-pixel-purple/30 to-pixel-cyan/20 border-2 border-pixel-purple rounded-lg animate-pulse">
            <div className="flex items-center justify-center gap-2 text-pixel-cyan">
              <span className="text-lg">👆</span>
              <span className="font-bold text-sm">点击此处继续对话</span>
              <span className="text-lg">👆</span>
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-1">NPC正在等待你的回应</div>
          </div>
        )}
      </div>

      {/* 使用 ChatInput 组件替代内联输入框 */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        disabled={disabled}
        placeholder={placeholder}
        npcs={npcs}
        selectedNpcId={selectedNpcId}
        onSelectNpc={onSelectNpc}
        mode={mode}
        hasSentFirstMessage={hasSentFirstMessage}
      />

      {/* 模式提示 */}
      {mode === 'reversed' && (
        <div className="dialogue-mode-hint bg-pixel-purple/20 border border-pixel-purple/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <div className="flex flex-col">
              <span className="text-xs text-pixel-purple font-bold">旁观模式 - AI正在模仿你</span>
              <span className="text-[10px] text-gray-400 mt-0.5">点击对话框继续对话，或按 [Ctrl+R] 恢复控制</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

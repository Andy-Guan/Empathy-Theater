'use client'

import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  npcs?: Array<{ id: string; name: string; avatar: string }>
  selectedNpcId?: string | null
  onSelectNpc?: (npcId: string) => void
  mode?: 'normal' | 'reversed'
  hasSentFirstMessage?: boolean  // 是否已发送过第一条消息（锁定角色选择）
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = '输入你的回复...',
  npcs = [],
  selectedNpcId = null,
  onSelectNpc,
  mode = 'normal',
  hasSentFirstMessage = false,
}: ChatInputProps) {
  const isReverted = mode === 'reversed'
  const canSelectRole = npcs.length > 0 && !hasSentFirstMessage && !isReverted

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim() && selectedNpcId) {
      e.preventDefault()
      onSend(value)
    }
  }

  return (
    <div className="relative z-10 p-4 bg-pixel-dark/90 pixel-border">
      {/* 角色反转功能说明面板 - 在角色反转模式下显示 */}
      {isReverted && (
        <div className="mb-3 p-3 bg-gradient-to-r from-pixel-purple/20 to-pixel-gold/10 border border-pixel-purple/50 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">📋</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-pixel-purple mb-1">角色反转功能说明</div>
              <div className="text-[10px] text-gray-300 leading-relaxed">
                AI 仅会模仿你说一句话，然后自动退出反转模式。如需再次使用，请重新点击"角色反转"按钮。
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-pixel-cyan">
                <span>✨</span>
                <span>点击对话框或输入内容即可继续对话</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3">
        {/* 角色选择下拉框 - 仅在首次发言前可修改 */}
        {npcs.length > 0 && (
          <select
            value={selectedNpcId || ''}
            onChange={(e) => onSelectNpc?.(e.target.value)}
            disabled={disabled || !canSelectRole}
            className="pixel-input px-2 py-1 text-[12px] bg-pixel-dark border border-pixel-cyan/50 rounded"
            title={canSelectRole ? '选择要控制的角色' : hasSentFirstMessage ? '角色选定后不可更改' : '角色反转模式下不可切换角色'}
          >
            <option value="">请选择角色...</option>
            {npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.avatar} {npc.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          className="pixel-input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedNpcId ? (isReverted ? '旁观模式中，输入继续对话...' : placeholder) : '先选择一个角色...'}
          disabled={disabled || !selectedNpcId}
        />
        <button
          className="pixel-btn text-[10px] py-2 px-4"
          onClick={() => value.trim() && selectedNpcId && onSend(value)}
          disabled={disabled || !value.trim() || !selectedNpcId}
        >
          发送
        </button>
      </div>
    </div>
  )
}

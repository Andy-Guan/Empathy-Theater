'use client'

import { useState } from 'react'

interface ReverseButtonProps {
  isReversed: boolean
  onClick: () => void
  disabled?: boolean
}

export default function ReverseButton({
  isReversed,
  onClick,
  disabled = false,
}: ReverseButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        className={`pixel-btn text-[8px] py-2 px-3 transition-all ${
          isReversed ? 'pixel-btn-purple' : 'pixel-btn-gold'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={isReversed ? '点击恢复控制' : 'Ctrl+R 切换角色'}
      >
        {isReversed ? (
          <>
            <span className="mr-1">✨</span>
            恢复控制
          </>
        ) : (
          <>
            <span className="mr-1">🔄</span>
            角色反转
          </>
        )}
      </button>
      {/* 功能说明 Tooltip */}
      {showTooltip && !isReversed && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-pixel-dark/95 border border-pixel-gold/50 rounded-lg shadow-lg z-50">
          <div className="text-xs text-pixel-gold font-bold mb-1">角色反转说明</div>
          <div className="text-[10px] text-gray-300 leading-relaxed">
            AI 将模仿你的说话风格说一句话，<span className="text-pixel-cyan">仅说一句</span>，然后自动恢复你自己控制。
          </div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="text-pixel-cyan">💡</span>
            <span>提示：模仿后会立即退出接管模式</span>
          </div>
          {/* 箭头 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-pixel-gold/50"></div>
        </div>
      )}
      {/* 反转模式提示 */}
      {showTooltip && isReversed && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-pixel-dark/95 border border-pixel-purple/50 rounded-lg shadow-lg z-50">
          <div className="text-xs text-pixel-purple font-bold mb-1">当前：旁观模式</div>
          <div className="text-[10px] text-gray-300 leading-relaxed">
            AI 正在模仿你发言，点击<span className="text-pixel-cyan">恢复控制</span>或直接输入继续对话。
          </div>
        </div>
      )}
    </div>
  )
}

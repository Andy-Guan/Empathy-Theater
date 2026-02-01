'use client'

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
  return (
    <button
      className={`pixel-btn text-[8px] py-2 px-3 transition-all ${
        isReversed ? 'pixel-btn-purple' : 'pixel-btn-gold'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title="Ctrl+R 切换角色"
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
  )
}

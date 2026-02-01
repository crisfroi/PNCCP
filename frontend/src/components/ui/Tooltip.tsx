import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  text: string
  children?: React.ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline-flex items-center">
      {children}
      <span
        className="ml-1.5 cursor-help text-gray-400 hover:text-institucional-primary"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label={text}
      >
        <HelpCircle className="h-4 w-4" />
      </span>
      {visible && (
        <span
          className="absolute left-0 top-full z-50 mt-1 max-w-xs rounded bg-gray-800 px-2 py-1.5 text-xs text-white shadow-lg"
          role="tooltip"
        >
          {text}
        </span>
      )}
    </span>
  )
}

import { useState } from 'react'

type CopierProps = {
  text: string
  title: string
}

const Copier = ({ text, title }: CopierProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3 items-center">
      <span className="text-primary text-[9px] font-pixel">{title}</span>

      <div
        className="bg-card border border-border w-80 flex items-center justify-between gap-3 p-5 cursor-pointer hover:border-primary transition-colors"
        onClick={() => handleCopy(text)}
        title="Copier le lien"
      >
        <p className="text-[9px] text-gray-500 truncate">{text}</p>
        <span className="text-primary shrink-0 text-[10px] font-pixel">
          {copiedUrl ? '✓' : '⧉'}
        </span>
      </div>
    </div>
  )
}

export default Copier

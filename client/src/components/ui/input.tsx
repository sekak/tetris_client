import { motion, type TargetAndTransition } from 'framer-motion'

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isAnimate?: boolean
  delay?: number
  initial?: TargetAndTransition
  animate?: TargetAndTransition
}

const Input = ({
  value,
  onChange,
  placeholder,
  isAnimate = false,
  delay = 0,
  initial,
  animate,
}: InputProps) => {
  const className =
    'w-full bg-card border border-border text-foreground text-center text-xs font-pixel py-3 px-4 outline-none focus:border-primary placeholder:text-muted transition-colors'

  if (isAnimate) {
    return (
      <motion.input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        initial={initial}
        animate={animate}
        transition={{ delay }}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}

export default Input

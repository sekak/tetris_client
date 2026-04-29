import React from 'react'
import { motion, type TargetAndTransition } from 'framer-motion'

interface ButtonProps {
  text: string
  onClick?: () => void
  variant: 'primary' | 'secondary' | 'accent' | 'ghost'
  disabled?: boolean
  isAnimate?: boolean
  delay?: number
  initial?: boolean | TargetAndTransition | undefined
  animate?: boolean | TargetAndTransition | undefined
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

const Button = ({
  text,
  onClick,
  variant,
  disabled = false,
  isAnimate = false,
  delay = 0,
  initial,
  animate,
  props,
}: ButtonProps) => {
  const baseClasses = 'w-full text-[9px] cursor-pointer py-3.5 font-pixel transition-colors'
  const variantClasses =
    variant === 'primary'
      ? 'bg-primary text-gray-800 hover:bg-primary/80 box-shadow-cyan'
      : variant === 'secondary'
        ? 'border border-secondary text-secondary hover:bg-secondary/20'
        : variant === 'accent'
          ? 'bg-accent text-gray-800 hover:bg-accent/80 box-shadow-yellow'
          : 'bg-transparent text-muted hover:text-accent cursor-pointer border border-border hover:border-accent'

  const disabledClasses = disabled ? 'opacity-60 !cursor-not-allowed' : ''
  const className = `${baseClasses} ${variantClasses} ${disabledClasses}`

  if (isAnimate) {
    return (
      <motion.button
        onClick={onClick}
        className={className}
        disabled={disabled}
        initial={initial}
        animate={animate}
        transition={{ delay }}
      >
        {text}
      </motion.button>
    )
  }

  return (
    <button onClick={onClick} className={className} disabled={disabled} {...props}>
      {text}
    </button>
  )
}

export default Button

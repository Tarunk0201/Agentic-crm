import { motion } from 'framer-motion'

function AudioWaveform({ isPlaying }) {
  return (
    <div className="mt-4 flex h-14 items-end justify-center gap-1">
      {Array.from({ length: 26 }).map((_, i) => (
        <motion.span
          key={i}
          animate={{ height: isPlaying ? [6, 32, 14, 24] : 8 }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.03 }}
          className="w-1 rounded-full bg-orange-400"
        />
      ))}
    </div>
  )
}

export default AudioWaveform

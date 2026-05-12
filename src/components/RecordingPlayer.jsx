import { motion } from 'framer-motion'
import { Download, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import AudioWaveform from './AudioWaveform'

const format = (secs) => {
  const total = Number.isFinite(secs) ? Math.max(0, Math.floor(secs)) : 0
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function RecordingPlayer({ recording }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [speed, setSpeed] = useState(1)

  const current = useMemo(() => duration * progress, [duration, progress])
  const seek = (value) => {
    const next = Number(value)
    setProgress(next)
    if (ref.current && Number.isFinite(ref.current.duration)) ref.current.currentTime = ref.current.duration * next
  }

  return (
    <div className="glass rounded-2xl p-5">
      <audio
        ref={ref}
        src={recording.url}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => ref.current && (ref.current.currentTime = Math.max(0, ref.current.currentTime - 10))} className="rounded-xl bg-orange-100 p-2 text-orange-600 hover:scale-105">
          <SkipBack size={18} />
        </button>
        <motion.button
          animate={playing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          onClick={() => {
            if (!ref.current) return
            if (playing) ref.current.pause()
            else ref.current.play()
            setPlaying((prev) => !prev)
          }}
          className="rounded-full bg-orange-500 p-5 text-white shadow-lg"
        >
          {playing ? <Pause /> : <Play />}
        </motion.button>
        <button onClick={() => ref.current && (ref.current.currentTime = Math.min(ref.current.duration || 0, ref.current.currentTime + 10))} className="rounded-xl bg-orange-100 p-2 text-orange-600 hover:scale-105">
          <SkipForward size={18} />
        </button>
      </div>
      <AudioWaveform isPlaying={playing} />
      <input type="range" min={0} max={1} step={0.01} value={progress} onChange={(e) => seek(e.target.value)} className="mt-4 w-full accent-orange-500" />
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
        <span>{format(current)}</span>
        <span>{format(duration)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-600">
          <Volume2 size={16} />
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => {
            const value = Number(e.target.value)
            setVolume(value)
            if (ref.current) ref.current.volume = value
          }} />
        </div>
        {[1, 1.5, 2].map((item) => (
          <button key={item} onClick={() => {
            setSpeed(item)
            if (ref.current) ref.current.playbackRate = item
          }} className={`rounded-xl px-3 py-1 text-sm ${speed === item ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
            {item}x
          </button>
        ))}
        <a href={recording.url} download={recording.filename} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-sm text-orange-600 shadow">
          <Download size={15} />
          Download
        </a>
      </div>
    </div>
  )
}

export default RecordingPlayer

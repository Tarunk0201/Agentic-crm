import { motion } from 'framer-motion'
import { Archive, Share2, Trash2, Upload } from 'lucide-react'

const actions = [
  { label: 'Export Call', icon: Upload },
  { label: 'Share', icon: Share2 },
  { label: 'Archive', icon: Archive },
  { label: 'Delete', icon: Trash2 },
]

function ActionCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.button key={action.label} whileHover={{ y: -3, scale: 1.02 }} className="glass rounded-2xl p-4 text-left text-zinc-700">
            <Icon size={18} className="mb-2 text-orange-500" />
            <p className="font-medium">{action.label}</p>
          </motion.button>
        )
      })}
    </div>
  )
}

export default ActionCards

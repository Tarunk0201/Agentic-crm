import { motion } from 'framer-motion'
import useCountUp from '../hooks/useCountUp'

function StatsCard({ stat }) {
  const count = useCountUp(stat.value)
  const value = stat.decimals ? count.toFixed(stat.decimals) : Math.round(count).toLocaleString()
  const Icon = stat.icon

  return (
    <motion.div whileHover={{ y: -1 }} className="glass card-glow rounded-[12px] border border-[#ffd7b0] px-3 py-2.5">
      <div className="flex items-start justify-between text-zinc-500">
        <p className="text-xs leading-tight">{stat.label}</p>
        <div className="rounded-md bg-[#fff2e6] p-1.5 text-[#ea8d3f]">
          <Icon size={12} />
        </div>
      </div>
      <p className="mt-2 text-[32px] font-semibold leading-none text-zinc-900">{stat.prefix}{value}{stat.suffix}</p>
    </motion.div>
  )
}

export default StatsCard;

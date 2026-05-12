import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'

function TriggerAutomationModal({ isOpen, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = React.useState('A')
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 p-6">
            <h2 className="text-xl font-semibold text-zinc-900">Trigger Automation</h2>
            <button onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 uppercase tracking-wider">Action Name</label>
              <input
                type="text"
                placeholder="e.g. Re-engagement Campaign"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#ea8d3f] focus:ring-1 focus:ring-[#ea8d3f]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <label className="mb-4 block text-xs font-medium text-zinc-500 uppercase tracking-wider">Choose Avatar</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setSelectedAvatar(letter)}
                        className={`flex aspect-video items-center justify-center rounded-lg border transition-all shadow-sm text-lg font-bold ${
                          selectedAvatar === letter 
                            ? 'border-[#ea8d3f] bg-orange-50 text-[#ea8d3f] ring-1 ring-[#ea8d3f]' 
                            : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <label className="mb-3 block text-xs font-medium text-zinc-500 uppercase tracking-wider">Select Gender</label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ea8d3f] focus:ring-1 focus:ring-[#ea8d3f]">
                      <option value="">Choose gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 h-full flex flex-col">
                  <label className="mb-3 block text-xs font-medium text-zinc-500 uppercase tracking-wider">Select Language</label>
                  <div className="relative mb-auto">
                    <select className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ea8d3f] focus:ring-1 focus:ring-[#ea8d3f]">
                      <option value="">Choose language</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="spanish">Spanish</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-100">
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500 uppercase tracking-wider">Automation Name</label>
                    <input
                      type="text"
                      placeholder="Enter automation name"
                      className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#ea8d3f] focus:ring-1 focus:ring-[#ea8d3f]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 bg-zinc-50/50 p-6 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="rounded-lg px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                alert('Automation triggered successfully!')
                onClose()
              }}
              className="rounded-lg bg-[#6b7280] px-6 py-2 text-sm font-medium text-white hover:bg-zinc-600 transition-colors"
            >
              Start Automation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TriggerAutomationModal

import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, Contact, Menu, ScrollText } from 'lucide-react'

const menuItems = [
  { label: 'Contacts', icon: Contact, path: '/contacts', children: [
    { label: 'Logs', path: '/logs' }
  ]},
]

function Sidebar({ mobileOpen, setMobileOpen }) {
  const content = (
    <div className="glass flex h-full flex-col gap-2.5 rounded-[14px] px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">HighVance CRM</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900">Binjwa</h1>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
          <ChevronLeft size={14} className="text-orange-500" />
        </button>
      </div>
      
      <div className="relative mb-2">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <Menu size={14} />
        </div>
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full rounded-lg border border-zinc-100 bg-[#f9f9f9] py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#ea8d3f]"
        />
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="relative flex flex-col gap-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive ? 'bg-[#fff2e6] text-[#da7d33]' : 'text-zinc-700 hover:bg-[#f8f8f8]'
                }`
              }
            >
              <Icon size={16} />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
            
            {item.children && (
              <div className="flex flex-col gap-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.label}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        isActive 
                          ? 'bg-[#fff2e6] text-[#da7d33]' 
                          : 'text-zinc-700 hover:bg-[#f8f8f8]'
                      }`
                    }
                  >
                    <ScrollText size={16} />
                    <span className="font-semibold">{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-40 rounded-lg bg-[#ea8d3f] p-2 text-white shadow-sm md:hidden">
        <Menu size={16} />
      </button>
      <aside className="hidden w-[190px] md:block">{content}</aside>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -230 }} transition={{ duration: 0.2 }} className="fixed inset-y-0 left-0 z-50 w-56 bg-white p-3 md:hidden">
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar

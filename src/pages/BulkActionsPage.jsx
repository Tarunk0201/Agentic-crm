import React, { useState } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { bulkActionsData } from '../data/mockData'
import Navbar from '../components/Navbar'
import ImportContactsModal from '../components/ImportContactsModal'

function BulkActionsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'Running': return 'bg-cyan-50 text-cyan-600 border-cyan-100'
      case 'Scheduled': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'Failed': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100'
    }
  }

  return (
    <div className="p-6">
      <Navbar onImportClick={() => setIsImportModalOpen(true)} />

      <div className="rounded-[20px] bg-white p-8 shadow-sm border border-zinc-100">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Bulk Actions</h1>
          <p className="mt-1 text-sm text-zinc-500">Track progress and results for bulk actions.</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex items-end gap-6">
          <div className="w-full max-w-[240px]">
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-zinc-100 bg-[#f9f9f9] px-4 py-2 text-sm outline-none focus:border-[#ea8d3f]">
                <option value="all">All</option>
                <option value="complete">Complete</option>
                <option value="running">Running</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search bulk actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-100 bg-[#f9f9f9] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#ea8d3f] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50 text-[13px] font-semibold text-zinc-900">
                <th className="pb-4 px-4 font-medium">Action Label</th>
                <th className="pb-4 px-4 font-medium">Action Name</th>
                <th className="pb-4 px-4 font-medium">Operation</th>
                <th className="pb-4 px-4 font-medium">Status</th>
                <th className="pb-4 px-4 font-medium">User</th>
                <th className="pb-4 px-4 font-medium">Created (IST)</th>
                <th className="pb-4 px-4 font-medium">Completed (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {bulkActionsData.map((action) => (
                <tr key={action.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <span className="text-sm font-medium text-zinc-900">{action.label}</span>
                  </td>
                  <td className="py-5 px-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{action.name}</p>
                      <p className="text-[11px] text-zinc-400">{action.subtext}</p>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-sm text-zinc-600">{action.operation}</td>
                  <td className="py-5 px-4">
                    <span className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{action.user}</p>
                      <p className="text-[11px] text-zinc-400">{action.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-sm text-zinc-600">{action.created}</td>
                  <td className="py-5 px-4 text-sm text-zinc-600">{action.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-between border-t border-zinc-50 pt-6">
          <p className="text-xs font-medium text-[#ea8d3f]">Showing 4 of 5 records</p>
          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50">
              <ChevronLeft size={14} /> Prev
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-xs font-bold text-zinc-900 shadow-sm border border-zinc-200">
              1
            </div>
            <button className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ImportContactsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  )
}

export default BulkActionsPage

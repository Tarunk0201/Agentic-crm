import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SearchBar({ query, setQuery, filterStatus, setFilterStatus }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex gap-2 relative">
      <div className="focus-ring flex flex-1 items-center rounded-[10px] border border-zinc-200 bg-[#fbfbfb] px-2.5">
        <Search size={14} className="text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, number, or call ID..."
          className="h-9 w-full bg-transparent px-2.5 text-sm text-zinc-700 outline-none"
        />
      </div>
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="rounded-[10px] border border-zinc-200 bg-white px-3 h-full text-zinc-500 transition hover:border-[#f2b277] hover:text-zinc-800"
        >
          <Filter size={14} />
        </button>
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-zinc-100"
            >
              <ul>
                <li
                  onClick={() => handleFilterChange("All")}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-zinc-50 ${
                    filterStatus === "All"
                      ? "font-semibold text-orange-500"
                      : "text-zinc-700"
                  }`}
                >
                  All
                </li>
                <li
                  onClick={() => handleFilterChange("Answered")}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-zinc-50 ${
                    filterStatus === "Answered"
                      ? "font-semibold text-orange-500"
                      : "text-zinc-700"
                  }`}
                >
                  Answered
                </li>
                <li
                  onClick={() => handleFilterChange("Not Answered")}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-zinc-50 ${
                    filterStatus === "Not Answered"
                      ? "font-semibold text-orange-500"
                      : "text-zinc-700"
                  }`}
                >
                  Not Answered
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SearchBar;

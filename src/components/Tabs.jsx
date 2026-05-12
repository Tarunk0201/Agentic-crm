import { motion } from "framer-motion";

function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="relative flex gap-3 overflow-x-auto border-b border-zinc-200 pb-1.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative px-1 py-1.5 text-sm font-semibold whitespace-nowrap ${activeTab === tab ? "text-[#ea8d3f]" : "text-zinc-500"}`}
        >
          {tab}
          {activeTab === tab && (
            <motion.span
              layoutId="tabUnderline"
              className="absolute right-0 bottom-0 left-0 h-0.5 rounded bg-[#ea8d3f]"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

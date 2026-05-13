import React from "react";

const CalendarToolbar = ({ label, view, views, onNavigate, onView }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-t-lg border-b border-zinc-200">
      <div className="flex items-center gap-x-2 mb-4 sm:mb-0">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
          onClick={() => onNavigate("PREV")}
        >
          Back
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
          onClick={() => onNavigate("NEXT")}
        >
          Next
        </button>
      </div>

      <div className="text-lg font-semibold text-zinc-800 order-first sm:order-none mb-4 sm:mb-0">
        {label}
      </div>

      <div className="flex items-center bg-zinc-100 p-1 rounded-md">
        {views
          .filter((v) => v !== "agenda")
          .map((viewName) => (
            <button
              key={viewName}
              type="button"
              className={`capitalize px-3 py-1 text-sm font-medium rounded-md ${
                view === viewName
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-200"
              }`}
              onClick={() => onView(viewName)}
            >
              {viewName}
            </button>
          ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;

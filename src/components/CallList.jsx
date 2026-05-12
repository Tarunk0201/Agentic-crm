import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../animations/motionPresets";
import CallLogItem from "./CallLogItem";

function CallList({ calls, selectedCallId, setSelectedCallId }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin"
    >
      {calls.map((call) => (
        <motion.div variants={fadeUp} key={call.id}>
          <CallLogItem
            call={call}
            active={call.id === selectedCallId}
            onClick={() => setSelectedCallId(call.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default CallList;

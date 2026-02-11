import { motion } from "framer-motion";
import { TeamMember } from "@/context/GameContext";

interface MemberListProps {
  members: TeamMember[];
}

const MemberList = ({ members }: MemberListProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {members.map((member, i) => (
        <motion.div
          key={member.id}
          className={`member-card ${member.eliminated ? "eliminated" : ""}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: member.eliminated ? 0.2 : 1, scale: member.eliminated ? 0.9 : 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-display text-lg font-bold
            ${member.eliminated ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary neon-border"}`}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          <p className={`font-body text-sm font-semibold truncate max-w-[80px] ${member.eliminated ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {member.name}
          </p>
          {member.eliminated && (
            <span className="text-xs text-primary font-display uppercase tracking-wider">OUT</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default MemberList;

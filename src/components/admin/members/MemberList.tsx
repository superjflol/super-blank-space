
import React from "react";
import { Member } from "../types/MemberTypes";
import MemberCard from "./MemberCard";
import { Loader2 } from "lucide-react";

interface MemberListProps {
  members: Member[];
  loading: boolean;
  reordering: boolean;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  loading,
  reordering,
  onEdit,
  onDelete,
  onMoveItem
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D946EF]"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          reordering={reordering}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveItem={onMoveItem}
          isFirst={members.indexOf(member) === 0}
          isLast={members.indexOf(member) === members.length - 1}
        />
      ))}
    </div>
  );
};

export default MemberList;

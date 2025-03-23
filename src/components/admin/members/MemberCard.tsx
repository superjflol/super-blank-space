
import React from "react";
import { Member } from "../types/MemberTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Edit, Trash2, ChevronUp, ChevronDown, Link, User } from "lucide-react";

interface MemberCardProps {
  member: Member;
  reordering: boolean;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  reordering,
  onEdit,
  onDelete,
  onMoveItem,
  isFirst,
  isLast
}) => {
  return (
    <Card key={member.id} className={`border border-white/10 bg-black/40 backdrop-blur-sm shadow-lg transition-all duration-300 ${reordering ? 'border-blue-500/30' : 'hover:shadow-[#D946EF]/20'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {reordering && (
            <div className="absolute right-4 top-4 flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onMoveItem(member.id, 'up')}
                disabled={isFirst}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-white/30"
              >
                <ChevronUp size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onMoveItem(member.id, 'down')}
                disabled={isLast}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-white/30"
              >
                <ChevronDown size={20} />
              </Button>
            </div>
          )}
          <div className="w-full md:w-1/4 flex justify-center">
            <div className="w-24 h-24 overflow-hidden rounded-lg border-2 border-[#D946EF]/30 shadow-lg">
              <AspectRatio ratio={1} className="bg-black/40">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <div>
              {reordering && (
                <div className="mb-3 inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded text-xs font-medium">
                  Position: {member.position}
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-[#D946EF] text-sm mb-2">{member.role}</p>
              <p className="text-xs text-gray-400 mb-3">Joined: {member.join_date}</p>
              <h4 className="font-semibold mb-2 text-white/80">Achievements:</h4>
              <ul className="space-y-1 text-sm">
                {member.achievements.map((achievement, idx) => (
                  <li key={idx} className="text-gray-300">• {achievement}</li>
                ))}
              </ul>
              {member.smogon && (
                <p className="text-xs text-blue-400 mt-2">
                  <a href={member.smogon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <Link size={12} /> Smogon Profile
                  </a>
                </p>
              )}
              {!reordering && (
                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={() => onEdit(member)}
                    className="bg-black/30 hover:bg-black/50 border border-white/10 hover:border-white/20 text-white transition-all duration-200"
                  >
                    <Edit size={16} className="mr-1.5" /> Edit
                  </Button>
                  <Button 
                    onClick={() => onDelete(member.id)}
                    className="bg-red-500/70 hover:bg-red-500/80 text-white transition-all duration-200"
                  >
                    <Trash2 size={16} className="mr-1.5" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;

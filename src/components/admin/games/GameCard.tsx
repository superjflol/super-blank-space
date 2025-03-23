
import React from "react";
import { Game } from "../types/GameTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Edit, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

interface GameCardProps {
  game: Game;
  reordering: boolean;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  reordering,
  onEdit,
  onDelete,
  onMoveItem,
  isFirst,
  isLast
}) => {
  return (
    <Card key={game.id} className={`border border-white/10 bg-black/40 backdrop-blur-sm shadow-lg transition-all duration-300 ${reordering ? 'border-blue-500/30' : 'hover:shadow-[#D946EF]/20'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {reordering && (
            <div className="absolute right-4 top-4 flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onMoveItem(game.id, 'up')}
                disabled={isFirst}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-white/30"
              >
                <ChevronUp size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onMoveItem(game.id, 'down')}
                disabled={isLast}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-white/30"
              >
                <ChevronDown size={20} />
              </Button>
            </div>
          )}
          
          <div>
            {reordering && (
              <div className="mb-3 inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded text-xs font-medium">
                Position: {game.position}
              </div>
            )}
            <div className="w-full aspect-video overflow-hidden rounded-lg border border-[#D946EF]/30 shadow-lg mb-4">
              <AspectRatio ratio={16/9} className="bg-black/40">
                <img 
                  src={game.image_url} 
                  alt={game.players} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{game.players}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium bg-[#D946EF]/20 text-[#D946EF] px-2 py-1 rounded">
                {game.tournament}
              </span>
              <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                {game.phase}
              </span>
              <span className="text-xs font-medium bg-green-500/20 text-green-300 px-2 py-1 rounded">
                {game.format}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-[#D946EF] mb-1">Description (IT):</h4>
                <p className="text-sm text-gray-300 line-clamp-3">{game.description_it}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#D946EF] mb-1">Description (EN):</h4>
                <p className="text-sm text-gray-300 line-clamp-3">{game.description_en}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <ExternalLink size={14} />
              <a 
                href={game.replay_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View Replay
              </a>
            </div>
            
            {!reordering && (
              <div className="flex space-x-2 mt-4">
                <Button 
                  onClick={() => onEdit(game)}
                  className="bg-black/30 hover:bg-black/50 border border-white/10 hover:border-white/20 text-white transition-all duration-200"
                >
                  <Edit size={16} className="mr-1.5" /> Edit
                </Button>
                <Button 
                  onClick={() => onDelete(game.id)}
                  className="bg-red-500/70 hover:bg-red-500/80 text-white transition-all duration-200"
                >
                  <Trash2 size={16} className="mr-1.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;

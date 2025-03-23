
import React from "react";
import { Game } from "../types/GameTypes";
import GameCard from "./GameCard";
import { Loader2 } from "lucide-react";

interface GameListProps {
  games: Game[];
  loading: boolean;
  reordering: boolean;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
}

const GameList: React.FC<GameListProps> = ({
  games,
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
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          reordering={reordering}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveItem={onMoveItem}
          isFirst={index === 0}
          isLast={index === games.length - 1}
        />
      ))}
    </div>
  );
};

export default GameList;

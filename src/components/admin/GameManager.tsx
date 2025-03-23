import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddGameForm from "./forms/AddGameForm";
import GameList from "./games/GameList";
import GameEditForm from "./games/GameEditForm";
import { Game } from "./types/GameTypes";

const GameManager = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [reordering, setReordering] = useState(false);
  const { toast } = useToast();
  
  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('best_games')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      
      // Map data to ensure it conforms to Game interface
      const typedGames: Game[] = data?.map(item => ({
        id: item.id,
        tournament: item.tournament,
        phase: item.phase,
        format: item.format,
        players: item.players,
        description_it: item.description_it,
        description_en: item.description_en,
        image_url: item.image_url,
        replay_url: item.replay_url,
        position: item.position || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setGames(typedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error fetching games",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleEdit = (game: Game) => {
    setEditingGame(game);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        const { error } = await supabase
          .from('best_games')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Game deleted",
          description: "The game has been deleted successfully",
        });

        // Refresh the list after deletion
        fetchGames();
      } catch (error) {
        console.error("Error deleting game:", error);
        toast({
          title: "Error deleting game",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdate = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from('best_games')
        .update({
          tournament: values.tournament,
          phase: values.phase,
          format: values.format,
          players: values.players,
          description_it: values.description_it,
          description_en: values.description_en,
          image_url: values.image_url,
          replay_url: values.replay_url,
          // Keep the existing position
          ...(editingGame && { position: editingGame.position })
        })
        .eq('id', editingGame.id)
        .select();

      if (error) throw error;

      toast({
        title: "Game updated",
        description: "The game has been updated successfully",
      });

      // Convert the response to match the Game interface
      const updatedGame: Game = {
        id: data[0].id,
        tournament: data[0].tournament,
        phase: data[0].phase,
        format: data[0].format,
        players: data[0].players,
        description_it: data[0].description_it,
        description_en: data[0].description_en,
        image_url: data[0].image_url,
        replay_url: data[0].replay_url,
        position: data[0].position || 0,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at
      };

      setGames(games.map(g => g.id === editingGame.id ? updatedGame : g));
      setEditingGame(null);
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        title: "Error updating game",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddGame = () => {
    // Refresh all games to get the correct order
    fetchGames();
  };

  const toggleReordering = () => {
    setReordering(!reordering);
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = games.findIndex(game => game.id === id);
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === games.length - 1)
      ) {
        return;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Get the two games we're swapping
      const game1 = games[currentIndex];
      const game2 = games[newIndex];
      
      // Swap their positions
      const tempPosition = game1.position;
      game1.position = game2.position;
      game2.position = tempPosition;
      
      // Update the first game
      const { error: error1 } = await supabase
        .from('best_games')
        .update({ 
          tournament: game1.tournament,
          phase: game1.phase,
          format: game1.format,
          players: game1.players,
          description_it: game1.description_it,
          description_en: game1.description_en,
          image_url: game1.image_url,
          replay_url: game1.replay_url,
          position: game1.position
        })
        .eq('id', game1.id);
        
      if (error1) throw error1;
      
      // Update the second game
      const { error: error2 } = await supabase
        .from('best_games')
        .update({ 
          tournament: game2.tournament,
          phase: game2.phase,
          format: game2.format,
          players: game2.players,
          description_it: game2.description_it,
          description_en: game2.description_en,
          image_url: game2.image_url,
          replay_url: game2.replay_url,
          position: game2.position
        })
        .eq('id', game2.id);
        
      if (error2) throw error2;

      // Refresh the games to get the updated order
      fetchGames();
      
    } catch (error) {
      console.error("Error updating position:", error);
      toast({
        title: "Error updating position",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gamepad2 size={24} className="text-[#D946EF]" /> Best Games Management
        </h2>
        <div className="flex gap-3">
          <Button 
            onClick={toggleReordering}
            className={`${reordering ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black/30 hover:bg-black/50'} 
              border border-white/10 text-white transition-all duration-200`}
          >
            {reordering ? 'Done Reordering' : 'Reorder Games'}
          </Button>
        </div>
      </div>
      
      {!reordering && <AddGameForm onAddGame={handleAddGame} />}
      
      <h2 className="text-xl font-bold mb-4 text-white/90 mt-8">
        {reordering ? 'Use arrows to reorder games' : 'Current Games'}
      </h2>

      {editingGame ? (
        <GameEditForm 
          game={editingGame} 
          onSave={handleUpdate} 
          onCancel={() => setEditingGame(null)} 
        />
      ) : (
        <GameList
          games={games}
          loading={loading}
          reordering={reordering}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveItem={moveItem}
        />
      )}
    </div>
  );
};

export default GameManager;

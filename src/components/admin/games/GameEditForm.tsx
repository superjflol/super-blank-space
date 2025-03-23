
import React from "react";
import { Game } from "../types/GameTypes";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Users, Joystick, Link, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";

interface GameEditFormProps {
  game: Game;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const GameEditForm: React.FC<GameEditFormProps> = ({ game, onSave, onCancel }) => {
  const editForm = useForm({
    defaultValues: {
      tournament: game.tournament,
      phase: game.phase,
      format: game.format,
      players: game.players,
      image_url: game.image_url,
      replay_url: game.replay_url,
      description_it: game.description_it,
      description_en: game.description_en
    }
  });

  return (
    <div className="space-y-4">
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={editForm.control}
              name="tournament"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Trophy size={14} className="text-[#D946EF]" /> Torneo
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="Nome del torneo" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Trophy size={14} className="text-[#D946EF]" /> Fase
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="Fase (es. Finals)" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Joystick size={14} className="text-[#D946EF]" /> Formato
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="Formato (es. Gen 9 OU)" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={editForm.control}
            name="players"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Users size={14} className="text-[#D946EF]" /> Giocatori
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    required 
                    placeholder="Nome dei giocatori (es. Player1 vs Player2)" 
                    className="bg-black/60 border-white/10 text-white"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Link size={14} className="text-[#D946EF]" /> URL Immagine
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="URL dell'immagine" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="replay_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Link size={14} className="text-[#D946EF]" /> URL Replay
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="URL del replay" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="description_it"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300">
                    Descrizione (Italiano)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      required 
                      placeholder="Descrizione in italiano" 
                      className="min-h-[120px] bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300">
                    Descrizione (English)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      required 
                      placeholder="Descrizione in inglese" 
                      className="min-h-[120px] bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              type="submit" 
              className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white flex items-center gap-2"
            >
              <Save size={16} /> Salva Modifiche
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
              className="border-white/10 bg-black/20 hover:bg-white/5 text-white flex items-center gap-2"
            >
              <X size={16} /> Annulla
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GameEditForm;

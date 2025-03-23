
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Gamepad2, Link2, Image, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AddGameForm = ({ onAddGame }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      format: "",
      phase: "",
      tournament: "",
      imageUrl: "",
      replayUrl: "",
      players: "",
      descriptionEn: "",
      descriptionIt: ""
    }
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Get highest position to add new item at the end
      const { data: existingGames, error: fetchError } = await supabase
        .from("best_games")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      // Calculate the new position (either 1 higher than the highest, or 1 if no records)
      const newPosition = existingGames && existingGames.length > 0 
        ? (existingGames[0]?.position ? existingGames[0].position + 1 : 1) 
        : 1;

      const { data, error } = await supabase.from("best_games").insert({
        format: values.format,
        phase: values.phase,
        tournament: values.tournament,
        image_url: values.imageUrl,
        replay_url: values.replayUrl,
        players: values.players,
        description_en: values.descriptionEn,
        description_it: values.descriptionIt,
        position: newPosition
      }).select();

      if (error) throw error;

      toast({
        title: "Gioco aggiunto",
        description: "Il gioco è stato aggiunto con successo",
      });

      form.reset();
      setIsOpen(false);

      if (onAddGame && data) {
        onAddGame(data[0]);
      }
    } catch (error) {
      console.error("Error adding game:", error);
      toast({
        title: "Errore nell'aggiunta del gioco",
        description: error.message || "Si è verificato un problema durante l'aggiunta del gioco",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button 
            className="w-full bg-[#D946EF] hover:bg-[#D946EF]/90 text-white font-medium py-3 rounded-lg shadow-lg shadow-[#D946EF]/20 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-xl hover:shadow-[#D946EF]/30 mb-4"
          >
            <Plus size={18} />
            <span>Aggiungi Nuova Partita</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden transition-all duration-300">
          <Card className="border border-white/10 bg-black/40 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-300 hover:shadow-[#D946EF]/5">
            <CardHeader className="bg-gradient-to-r from-[#D946EF]/20 to-transparent border-b border-white/10 px-6 py-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 size={18} className="text-[#D946EF]" /> Dettagli Nuova Partita
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">
                            Formato
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              required 
                              placeholder="es. VGC 2023" 
                              className="bg-black/60 border-white/10 text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">
                            Fase
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              required 
                              placeholder="es. Finali" 
                              className="bg-black/60 border-white/10 text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="tournament"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                          <Info size={14} className="text-[#D946EF]" /> Torneo
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                            <Image size={14} className="text-[#D946EF]" /> URL Immagine
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              required 
                              placeholder="Inserisci URL immagine" 
                              className="bg-black/60 border-white/10 text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="replayUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                            <Link2 size={14} className="text-[#D946EF]" /> URL Replay
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              required 
                              placeholder="Inserisci URL replay" 
                              className="bg-black/60 border-white/10 text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
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
                            placeholder="es. Giocatore 1 vs Giocatore 2" 
                            className="bg-black/60 border-white/10 text-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Descrizione (Inglese)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            required 
                            placeholder="Inserisci descrizione in inglese" 
                            className="min-h-[100px] bg-black/60 border-white/10 text-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="descriptionIt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Descrizione (Italiano)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            required 
                            placeholder="Inserisci descrizione in italiano" 
                            className="min-h-[100px] bg-black/60 border-white/10 text-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#D946EF] hover:bg-[#D946EF]/90 text-white font-medium py-3 rounded-lg shadow-lg shadow-[#D946EF]/20 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-xl hover:shadow-[#D946EF]/30"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus size={18} />
                    )}
                    <span>Aggiungi Partita</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AddGameForm;


import React from "react";
import { Member } from "../types/MemberTypes";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Image, Calendar, ListChecks, Link, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";

interface MemberEditFormProps {
  member: Member;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const MemberEditForm: React.FC<MemberEditFormProps> = ({ member, onSave, onCancel }) => {
  const editForm = useForm({
    defaultValues: {
      name: member.name,
      image: member.image,
      role: member.role,
      joinDate: member.join_date || "",
      achievements: member.achievements.join("\n"),
      smogon: member.smogon || ""
    }
  });

  return (
    <div className="space-y-4">
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <User size={14} className="text-[#D946EF]" /> Nome
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="Inserisci nome del membro" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="image"
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300">
                    Ruolo
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      required 
                      placeholder="Inserisci ruolo" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#D946EF]" /> Data Ingresso
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="es. Settembre 2015" 
                      className="bg-black/60 border-white/10 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={editForm.control}
            name="smogon"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Link size={14} className="text-[#D946EF]" /> URL Profilo Smogon
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Link al profilo Smogon (opzionale)" 
                    className="bg-black/60 border-white/10 text-white"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={editForm.control}
            name="achievements"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <ListChecks size={14} className="text-[#D946EF]" /> Risultati (uno per riga)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    required 
                    placeholder="Inserisci ogni risultato su una nuova riga" 
                    className="min-h-[120px] bg-black/60 border-white/10 text-white"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
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

export default MemberEditForm;

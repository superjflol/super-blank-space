
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash, PenSquare, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { moveItemUp, moveItemDown } from "@/lib/utils";

interface FAQ {
  id: string;
  question_it: string;
  question_en: string;
  answer_it: string;
  answer_en: string;
  position: number;
  is_active: boolean;
}

const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFaq, setNewFaq] = useState<Omit<FAQ, "id" | "created_at" | "updated_at">>({
    question_it: "",
    question_en: "",
    answer_it: "",
    answer_en: "",
    position: 0,
    is_active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      console.error("Error fetching FAQs:", error);
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();

    // Set up real-time listener
    const subscription = supabase
      .channel("faqs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "faqs" },
        () => {
          fetchFAQs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAddFaq = async () => {
    try {
      setIsSubmitting(true);
      
      if (!newFaq.question_it || !newFaq.question_en || !newFaq.answer_it || !newFaq.answer_en) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }

      // Determine the next position
      const nextPosition = faqs.length > 0 
        ? Math.max(...faqs.map(faq => faq.position)) + 1 
        : 0;
      
      const faqToAdd = {
        ...newFaq,
        position: nextPosition
      };

      const { error } = await supabase.from("faqs").insert([faqToAdd]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ added successfully",
      });
      
      setNewFaq({
        question_it: "",
        question_en: "",
        answer_it: "",
        answer_en: "",
        position: 0,
        is_active: true,
      });
      
      setDialogOpen(false);
      fetchFAQs();
    } catch (error: any) {
      console.error("Error adding FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add FAQ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFaq = async () => {
    try {
      setIsSubmitting(true);
      
      if (!editingFaq) return;
      
      // Keep the original position when updating
      const { error } = await supabase
        .from("faqs")
        .update({
          question_it: editingFaq.question_it,
          question_en: editingFaq.question_en,
          answer_it: editingFaq.answer_it,
          answer_en: editingFaq.answer_en,
          is_active: editingFaq.is_active,
          // Don't update position to maintain order
        })
        .eq("id", editingFaq.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });
      
      setEditingFaq(null);
      setDialogOpen(false);
      fetchFAQs();
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update FAQ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
      
      fetchFAQs();
    } catch (error: any) {
      console.error("Error deleting FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from("faqs")
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `FAQ ${is_active ? "deactivated" : "activated"} successfully`,
      });
      
      fetchFAQs();
    } catch (error: any) {
      console.error("Error toggling FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update FAQ",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    try {
      const updatedFaqs = moveItemUp([...faqs], index);
      const faqToUpdate = updatedFaqs[index - 1];
      const prevFaq = updatedFaqs[index];
      
      await Promise.all([
        supabase.from("faqs").update({ position: faqToUpdate.position }).eq("id", faqToUpdate.id),
        supabase.from("faqs").update({ position: prevFaq.position }).eq("id", prevFaq.id)
      ]);
      
      fetchFAQs();
    } catch (error: any) {
      console.error("Error moving FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= faqs.length - 1) return;
    
    try {
      const updatedFaqs = moveItemDown([...faqs], index);
      const faqToUpdate = updatedFaqs[index + 1];
      const nextFaq = updatedFaqs[index];
      
      await Promise.all([
        supabase.from("faqs").update({ position: faqToUpdate.position }).eq("id", faqToUpdate.id),
        supabase.from("faqs").update({ position: nextFaq.position }).eq("id", nextFaq.id)
      ]);
      
      fetchFAQs();
    } catch (error: any) {
      console.error("Error moving FAQ:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-[#D946EF]" /> FAQ Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white font-medium shadow-md shadow-[#D946EF]/20 hover:shadow-lg hover:shadow-[#D946EF]/30 transition-all duration-200"
              onClick={() => {
                setEditingFaq(null);
                setNewFaq({
                  question_it: "",
                  question_en: "",
                  answer_it: "",
                  answer_en: "",
                  position: faqs.length,
                  is_active: true,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-jf-dark border-[#D946EF]/20 text-jf-light">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#D946EF]" />
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="question_it" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Question (Italian)
                  </Label>
                  <Input
                    id="question_it"
                    value={editingFaq ? editingFaq.question_it : newFaq.question_it}
                    onChange={(e) => editingFaq 
                      ? setEditingFaq({...editingFaq, question_it: e.target.value})
                      : setNewFaq({...newFaq, question_it: e.target.value})
                    }
                    className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    placeholder="Inserisci la domanda in italiano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question_en" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Question (English)
                  </Label>
                  <Input
                    id="question_en"
                    value={editingFaq ? editingFaq.question_en : newFaq.question_en}
                    onChange={(e) => editingFaq
                      ? setEditingFaq({...editingFaq, question_en: e.target.value})
                      : setNewFaq({...newFaq, question_en: e.target.value})
                    }
                    className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    placeholder="Enter question in English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="answer_it" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Answer (Italian) - Markdown
                  </Label>
                  <Textarea
                    id="answer_it"
                    rows={8}
                    value={editingFaq ? editingFaq.answer_it : newFaq.answer_it}
                    onChange={(e) => editingFaq
                      ? setEditingFaq({...editingFaq, answer_it: e.target.value})
                      : setNewFaq({...newFaq, answer_it: e.target.value})
                    }
                    placeholder="Supporta la formattazione markdown"
                    className="min-h-[180px] bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer_en" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Answer (English) - Markdown
                  </Label>
                  <Textarea
                    id="answer_en"
                    rows={8}
                    value={editingFaq ? editingFaq.answer_en : newFaq.answer_en}
                    onChange={(e) => editingFaq
                      ? setEditingFaq({...editingFaq, answer_en: e.target.value})
                      : setNewFaq({...newFaq, answer_en: e.target.value})
                    }
                    placeholder="Supports markdown formatting"
                    className="min-h-[180px] bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                  />
                </div>
              </div>
              {!editingFaq && (
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                      Position
                    </Label>
                    <Input
                      id="position"
                      type="number"
                      value={newFaq.position}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setNewFaq({...newFaq, position: value});
                      }}
                      className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_active"
                      checked={editingFaq ? editingFaq.is_active : newFaq.is_active}
                      onCheckedChange={(checked) => editingFaq
                        ? setEditingFaq({...editingFaq, is_active: checked})
                        : setNewFaq({...newFaq, is_active: checked})
                      }
                      className="data-[state=checked]:bg-[#D946EF]"
                    />
                    <Label htmlFor="is_active" className="text-white">Active</Label>
                  </div>
                </div>
              )}
              {editingFaq && (
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="is_active"
                    checked={editingFaq.is_active}
                    onCheckedChange={(checked) => 
                      setEditingFaq({...editingFaq, is_active: checked})
                    }
                    className="data-[state=checked]:bg-[#D946EF]"
                  />
                  <Label htmlFor="is_active" className="text-white">Active</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} 
                className="border-[#D946EF]/50 text-[#D946EF] hover:bg-[#D946EF]/10">
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-md shadow-[#D946EF]/20 hover:shadow-lg transition-all duration-200"
                onClick={editingFaq ? handleEditFaq : handleAddFaq}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingFaq ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingFaq ? "Update FAQ" : "Add FAQ"}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#D946EF]" />
            <p className="text-gray-400">Loading FAQs...</p>
          </div>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
          <HelpCircle className="h-12 w-12 text-[#D946EF]/50 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2 text-white">No FAQs Found</h3>
          <p className="text-gray-500 mb-6">Add your first FAQ using the button above.</p>
          <Button 
            className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-md shadow-[#D946EF]/20 hover:shadow-lg transition-all duration-200"
            onClick={() => {
              setEditingFaq(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add First FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={faq.id} className={`border ${!faq.is_active ? "border-white/5 bg-black/40" : "border-white/10 bg-black/60"} backdrop-blur-sm hover:shadow-md hover:shadow-[#D946EF]/5 transition-all duration-300`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-white group-hover:text-white transition-colors">
                        {faq.question_en}
                      </CardTitle>
                      {!faq.is_active && (
                        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1 text-gray-400">
                      Position: {faq.position}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Switch
                      id={`active-${faq.id}`}
                      checked={faq.is_active}
                      onCheckedChange={() => handleToggleActive(faq.id, faq.is_active)}
                      className="data-[state=checked]:bg-[#D946EF]"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingFaq(faq);
                        setDialogOpen(true);
                      }}
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-500/20"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-1 pb-4">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm font-medium text-[#D946EF] mb-1">Domanda:</p>
                    <p className="text-sm text-gray-300">{faq.question_it}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#D946EF] mb-1">Risposta:</p>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {faq.answer_it.length > 100 ? `${faq.answer_it.substring(0, 100)}...` : faq.answer_it}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQManager;

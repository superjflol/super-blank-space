
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash, PenSquare, ArrowUp, ArrowDown, Link2, ExternalLink } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { moveItemUp, moveItemDown } from "@/lib/utils";

interface FooterResource {
  id: string;
  title_it: string;
  title_en: string;
  url: string;
  icon: string | null;
  category: string;
  position: number;
  is_active: boolean;
}

const CATEGORIES = ["links", "social", "legal", "support"];

const FooterResourceManager = () => {
  const [resources, setResources] = useState<FooterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResource, setNewResource] = useState<Omit<FooterResource, "id" | "created_at" | "updated_at">>({
    title_it: "",
    title_en: "",
    url: "",
    icon: "",
    category: "links",
    position: 0,
    is_active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<FooterResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("footer_resources")
        .select("*")
        .order("category", { ascending: true })
        .order("position", { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error("Error fetching footer resources:", error);
      toast({
        title: "Error",
        description: "Failed to load footer resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    // Set up real-time listener
    const subscription = supabase
      .channel("footer-resources-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "footer_resources" },
        () => {
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAddResource = async () => {
    try {
      setIsSubmitting(true);
      
      if (!newResource.title_it || !newResource.title_en || !newResource.url || !newResource.category) {
        toast({
          title: "Validation Error",
          description: "Title, URL, and category are required",
          variant: "destructive",
        });
        return;
      }

      // Get the next position for this category
      const categoryResources = resources.filter(r => r.category === newResource.category);
      const nextPosition = categoryResources.length > 0 
        ? Math.max(...categoryResources.map(r => r.position)) + 1 
        : 0;
      
      const resourceToAdd = {
        ...newResource,
        position: nextPosition
      };

      const { error } = await supabase.from("footer_resources").insert([resourceToAdd]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource added successfully",
      });
      
      setNewResource({
        title_it: "",
        title_en: "",
        url: "",
        icon: "",
        category: "links",
        position: 0,
        is_active: true,
      });
      
      setDialogOpen(false);
      fetchResources();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResource = async () => {
    try {
      setIsSubmitting(true);
      
      if (!editingResource) return;
      
      // Keep the original position when updating
      const { error } = await supabase
        .from("footer_resources")
        .update({
          title_it: editingResource.title_it,
          title_en: editingResource.title_en,
          url: editingResource.url,
          icon: editingResource.icon,
          category: editingResource.category,
          is_active: editingResource.is_active
          // Don't update position to maintain order
        })
        .eq("id", editingResource.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
      
      setEditingResource(null);
      setDialogOpen(false);
      fetchResources();
    } catch (error: any) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase.from("footer_resources").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
      
      fetchResources();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from("footer_resources")
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Resource ${is_active ? "deactivated" : "activated"} successfully`,
      });
      
      fetchResources();
    } catch (error: any) {
      console.error("Error toggling resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update resource",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (categoryResources: FooterResource[], index: number) => {
    if (index <= 0) return;
    
    try {
      const updatedResources = moveItemUp([...categoryResources], index);
      const resourceToUpdate = updatedResources[index - 1];
      const prevResource = updatedResources[index];
      
      await Promise.all([
        supabase.from("footer_resources").update({ position: resourceToUpdate.position }).eq("id", resourceToUpdate.id),
        supabase.from("footer_resources").update({ position: prevResource.position }).eq("id", prevResource.id)
      ]);
      
      fetchResources();
    } catch (error: any) {
      console.error("Error moving resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder resource",
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (categoryResources: FooterResource[], index: number) => {
    if (index >= categoryResources.length - 1) return;
    
    try {
      const updatedResources = moveItemDown([...categoryResources], index);
      const resourceToUpdate = updatedResources[index + 1];
      const nextResource = updatedResources[index];
      
      await Promise.all([
        supabase.from("footer_resources").update({ position: resourceToUpdate.position }).eq("id", resourceToUpdate.id),
        supabase.from("footer_resources").update({ position: nextResource.position }).eq("id", nextResource.id)
      ]);
      
      fetchResources();
    } catch (error: any) {
      console.error("Error moving resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder resource",
        variant: "destructive",
      });
    }
  };

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, FooterResource[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Link2 className="h-7 w-7 text-[#D946EF]" /> Resources Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage website footer links and resources</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white font-medium shadow-md shadow-[#D946EF]/20 hover:shadow-lg hover:shadow-[#D946EF]/30 transition-all duration-200"
              onClick={() => {
                setEditingResource(null);
                setNewResource({
                  title_it: "",
                  title_en: "",
                  url: "",
                  icon: "",
                  category: "links",
                  position: resources.length,
                  is_active: true,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-jf-dark border-[#D946EF]/20 text-jf-light">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Link2 className="h-5 w-5 text-[#D946EF]" />
                {editingResource ? "Edit Resource" : "Add New Resource"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="title_it" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Title (Italian)
                  </Label>
                  <Input
                    id="title_it"
                    value={editingResource ? editingResource.title_it : newResource.title_it}
                    onChange={(e) => editingResource 
                      ? setEditingResource({...editingResource, title_it: e.target.value})
                      : setNewResource({...newResource, title_it: e.target.value})
                    }
                    className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    placeholder="Inserisci titolo in italiano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_en" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Title (English)
                  </Label>
                  <Input
                    id="title_en"
                    value={editingResource ? editingResource.title_en : newResource.title_en}
                    onChange={(e) => editingResource
                      ? setEditingResource({...editingResource, title_en: e.target.value})
                      : setNewResource({...newResource, title_en: e.target.value})
                    }
                    className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    placeholder="Enter title in English"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4 text-[#D946EF]" /> URL
                </Label>
                <Input
                  id="url"
                  value={editingResource ? editingResource.url : newResource.url}
                  onChange={(e) => editingResource
                    ? setEditingResource({...editingResource, url: e.target.value})
                    : setNewResource({...newResource, url: e.target.value})
                  }
                  className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  Icon (optional Lucide icon name)
                </Label>
                <Input
                  id="icon"
                  value={editingResource ? editingResource.icon || "" : newResource.icon || ""}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    editingResource
                      ? setEditingResource({...editingResource, icon: value})
                      : setNewResource({...newResource, icon: value});
                  }}
                  placeholder="e.g. 'Github', 'Twitter', 'Facebook', etc."
                  className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    Category
                  </Label>
                  <Select
                    value={editingResource ? editingResource.category : newResource.category}
                    onValueChange={(value) => editingResource
                      ? setEditingResource({...editingResource, category: value})
                      : setNewResource({...newResource, category: value})
                    }
                  >
                    <SelectTrigger id="category" className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-jf-dark border-[#D946EF]/30 text-white">
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="focus:bg-[#D946EF]/20 focus:text-white">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editingResource && (
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                      Position
                    </Label>
                    <Input
                      id="position"
                      type="number"
                      value={newResource.position}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setNewResource({...newResource, position: value});
                      }}
                      className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-inner shadow-black/20 focus-visible:ring-[#D946EF]"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="is_active"
                  checked={editingResource ? editingResource.is_active : newResource.is_active}
                  onCheckedChange={(checked) => editingResource
                    ? setEditingResource({...editingResource, is_active: checked})
                    : setNewResource({...newResource, is_active: checked})
                  }
                  className="data-[state=checked]:bg-[#D946EF]"
                />
                <Label htmlFor="is_active" className="text-white">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                className="border-[#D946EF]/50 text-[#D946EF] hover:bg-[#D946EF]/10">
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-md shadow-[#D946EF]/20 hover:shadow-lg transition-all duration-200"
                onClick={editingResource ? handleEditResource : handleAddResource}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingResource ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingResource ? "Update Resource" : "Add Resource"}</>
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
            <p className="text-gray-400">Loading resources...</p>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
          <Link2 className="h-12 w-12 text-[#D946EF]/50 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2 text-white">No Resources Found</h3>
          <p className="text-gray-500 mb-6">Add your first resource using the button above.</p>
          <Button 
            className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-md shadow-[#D946EF]/20 hover:shadow-lg transition-all duration-200"
            onClick={() => {
              setEditingResource(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add First Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedResources).map(([category, categoryResources]) => (
            <div key={category} className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white capitalize flex items-center gap-2">
                {category === "links" && <Link2 className="h-5 w-5 text-[#D946EF]" />}
                {category === "social" && <ExternalLink className="h-5 w-5 text-[#D946EF]" />}
                {category}
                <Badge className="ml-2 bg-[#D946EF]/20 text-white border-[#D946EF]/30">
                  {categoryResources.length}
                </Badge>
              </h3>
              <div className="space-y-3">
                {categoryResources.map((resource, index) => (
                  <Card key={resource.id} className={`border ${!resource.is_active ? "border-white/5 bg-black/40" : "border-white/10 bg-black/60"} backdrop-blur-sm hover:shadow-md hover:shadow-[#D946EF]/5 transition-all duration-300`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{resource.title_en}</h4>
                            {!resource.is_active && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 mt-2">
                            <div>
                              <p className="text-sm text-[#D946EF]">Italian:</p>
                              <p className="text-sm text-gray-300">{resource.title_it}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#D946EF]">URL:</p>
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-gray-300 hover:text-white flex items-center gap-1 overflow-hidden text-ellipsis"
                              >
                                {resource.url.length > 30 ? `${resource.url.substring(0, 30)}...` : resource.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                          {resource.icon && (
                            <div className="mt-1">
                              <p className="text-sm text-[#D946EF]">Icon:</p>
                              <p className="text-sm text-gray-300">{resource.icon}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveUp(categoryResources, index)}
                            disabled={index === 0}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveDown(categoryResources, index)}
                            disabled={index === categoryResources.length - 1}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Switch
                            id={`active-${resource.id}`}
                            checked={resource.is_active}
                            onCheckedChange={() => handleToggleActive(resource.id, resource.is_active)}
                            className="data-[state=checked]:bg-[#D946EF]"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingResource(resource);
                              setDialogOpen(true);
                            }}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#D946EF]/10"
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteResource(resource.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-500/20"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FooterResourceManager;

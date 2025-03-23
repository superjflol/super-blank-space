import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMemberForm from "./forms/AddMemberForm";
import MemberList from "./members/MemberList";
import MemberEditForm from "./members/MemberEditForm";
import { Member } from "./types/MemberTypes";

const MemberManager = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [reordering, setReordering] = useState(false);
  const { toast } = useToast();
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Now use position field for ordering
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      
      // Map data to ensure it conforms to Member interface
      const typedMembers: Member[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        role: item.role,
        join_date: item.join_date || undefined,
        achievements: item.achievements || [],
        position: item.position || 0,
        smogon: item.smogon || undefined
      })) || [];
      
      setMembers(typedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEdit = (member: Member) => {
    setEditingMember(member);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Member deleted",
          description: "The member has been deleted successfully",
        });

        // Refresh the list after deletion
        fetchMembers();
      } catch (error) {
        console.error("Error deleting member:", error);
        toast({
          title: "Error deleting member",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdate = async (values: any) => {
    const achievementsArray = values.achievements
      .split("\n")
      .map((a: string) => a.trim())
      .filter((a: string) => a);

    try {
      const { data, error } = await supabase
        .from('members')
        .update({
          name: values.name,
          image: values.image,
          role: values.role,
          join_date: values.joinDate,
          achievements: achievementsArray,
          smogon: values.smogon || null,
          // Only include position if editingMember exists
          ...(editingMember && { position: editingMember.position })
        })
        .eq('id', editingMember.id)
        .select();

      if (error) throw error;

      toast({
        title: "Member updated",
        description: "The member has been updated successfully",
      });

      // Convert the response to match the Member interface
      const updatedMember: Member = {
        id: data[0].id,
        name: data[0].name,
        image: data[0].image,
        role: data[0].role,
        join_date: data[0].join_date || undefined,
        achievements: data[0].achievements,
        position: data[0].position || 0,
        smogon: data[0].smogon || undefined
      };

      setMembers(members.map(m => m.id === editingMember.id ? updatedMember : m));
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating member:", error);
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddMember = () => {
    // Refresh all members to get the correct order
    fetchMembers();
  };

  const toggleReordering = () => {
    setReordering(!reordering);
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = members.findIndex(member => member.id === id);
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === members.length - 1)
      ) {
        return;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Get the two members we're swapping
      const member1 = members[currentIndex];
      const member2 = members[newIndex];
      
      // Swap their positions
      const tempPosition = member1.position;
      member1.position = member2.position;
      member2.position = tempPosition;
      
      // Update the first member - update complete member object including position
      const { error: error1 } = await supabase
        .from('members')
        .update({ 
          name: member1.name,
          image: member1.image,
          role: member1.role,
          join_date: member1.join_date,
          achievements: member1.achievements,
          position: member1.position,
          smogon: member1.smogon
        })
        .eq('id', member1.id);
        
      if (error1) throw error1;
      
      // Update the second member - update complete member object including position
      const { error: error2 } = await supabase
        .from('members')
        .update({ 
          name: member2.name,
          image: member2.image,
          role: member2.role,
          join_date: member2.join_date,
          achievements: member2.achievements,
          position: member2.position,
          smogon: member2.smogon
        })
        .eq('id', member2.id);
        
      if (error2) throw error2;

      // Refresh the members to get the updated order
      fetchMembers();
      
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
          <Award size={24} className="text-[#D946EF]" /> Team Members Management
        </h2>
        <div className="flex gap-3">
          <Button 
            onClick={toggleReordering}
            className={`${reordering ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black/30 hover:bg-black/50'} 
              border border-white/10 text-white transition-all duration-200`}
          >
            {reordering ? 'Done Reordering' : 'Reorder Members'}
          </Button>
        </div>
      </div>
      
      {!reordering && <AddMemberForm onAddMember={handleAddMember} />}
      
      <h2 className="text-xl font-bold mb-4 text-white/90 mt-8">
        {reordering ? 'Use arrows to reorder members' : 'Current Team Members'}
      </h2>

      {editingMember ? (
        <MemberEditForm 
          member={editingMember} 
          onSave={handleUpdate} 
          onCancel={() => setEditingMember(null)} 
        />
      ) : (
        <MemberList
          members={members}
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

export default MemberManager;


import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [firstAdmin, setFirstAdmin] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAdmins(data || []);
      
      if (data && data.length > 0) {
        setFirstAdmin(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Error fetching admins",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        if (user) {
          setUsers([{
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          }]);
        }
        return;
      }
      
      setUsers(data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const matchedUser = users.find(u => u.email === newAdminEmail);
      
      if (!matchedUser) {
        toast({
          title: "User not found",
          description: "No user with that email exists in the system",
          variant: "destructive",
        });
        return;
      }

      const isAlreadyAdmin = admins.some(admin => admin.id === matchedUser.id);
      
      if (isAlreadyAdmin) {
        toast({
          title: "Already an admin",
          description: "This user is already an admin",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('admins')
        .insert({
          id: matchedUser.id,
          email: matchedUser.email,
          is_active: true
        })
        .select();

      if (error) throw error;

      toast({
        title: "Admin added",
        description: "The admin has been added successfully",
      });

      setNewAdminEmail("");
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "Error adding admin",
        description: error.message || "There was a problem adding the admin",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdminStatus = async (id, isCurrentlyActive) => {
    if (id === firstAdmin) {
      toast({
        title: "Cannot deactivate first admin",
        description: "The first registered admin cannot be deactivated for security reasons",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('admins')
        .update({ is_active: !isCurrentlyActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isCurrentlyActive ? "Admin deactivated" : "Admin activated",
        description: isCurrentlyActive 
          ? "The admin has been deactivated successfully"
          : "The admin has been activated successfully",
      });

      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({
        title: "Error updating admin",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (id === firstAdmin) {
      toast({
        title: "Cannot delete first admin",
        description: "The first registered admin cannot be deleted for security reasons",
        variant: "destructive",
      });
      return;
    }
    
    if (id === user?.id) {
      toast({
        title: "Cannot delete yourself",
        description: "You cannot remove your own admin privileges",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Admin deleted",
          description: "The admin has been deleted successfully",
        });

        fetchAdmins();
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast({
          title: "Error deleting admin",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-[#D946EF]" /> Admin Management
        </h2>
      </div>
      
      <Card className="border border-white/10 bg-black/40 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-[#D946EF]/20 to-transparent border-b border-white/10 px-6 py-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Plus size={18} className="text-[#D946EF]" /> Add New Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 bg-black/50 border-white/10 text-white"
            />
            <Button onClick={handleAddAdmin} className="bg-[#D946EF] hover:bg-[#D946EF]/90 text-white">
              <Plus size={16} className="mr-1.5" /> Add Admin
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Note: The user must already have an account in the system
          </p>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-bold mb-4 text-white/90">Current Admins</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D946EF]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {admins.length === 0 ? (
            <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-center py-8 text-gray-400">No admins found</p>
              </CardContent>
            </Card>
          ) : (
            admins.map((admin) => (
              <Card key={admin.id} className="border border-white/10 bg-black/40 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{admin.email}</h3>
                      <p className="text-sm text-gray-400">ID: {admin.id}</p>
                      <div className="mt-1">
                        {admin.is_active ? (
                          <span className="status-badge bg-green-500/20 text-green-300 border border-green-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="status-badge bg-red-500/20 text-red-300 border border-red-500/30">
                            Inactive
                          </span>
                        )}
                        {admin.id === firstAdmin && (
                          <span className="status-badge bg-amber-500/20 text-amber-300 border border-amber-500/30 ml-2">
                            Primary Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleAdminStatus(admin.id, admin.is_active)}
                        className={admin.is_active ? "bg-white/10 hover:bg-white/15 text-white" : "bg-green-500/20 hover:bg-green-500/30 text-green-300"}
                        disabled={admin.id === firstAdmin}
                      >
                        {admin.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="bg-red-500/70 hover:bg-red-500/80 text-white"
                        disabled={admin.id === user?.id || admin.id === firstAdmin}
                      >
                        <Trash2 size={16} className="mr-1.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <h2 className="text-xl font-bold my-6 text-white/90">Registered Users</h2>
      <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-black/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => {
                const isAdmin = admins.some(admin => admin.id === user.id && admin.is_active);
                const isPrimaryAdmin = user.id === firstAdmin;
                return (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {isAdmin && isPrimaryAdmin ? (
                        <span className="status-badge bg-amber-500/20 text-amber-300 border border-amber-500/30">Primary Admin</span>
                      ) : isAdmin ? (
                        <span className="status-badge bg-green-500/20 text-green-300 border border-green-500/30">Admin</span>
                      ) : (
                        <span className="status-badge bg-gray-500/20 text-gray-300 border border-gray-500/30">User</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManager;

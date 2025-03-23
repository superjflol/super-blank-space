
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import FAQManager from "@/components/admin/FAQManager";
import FooterResourceManager from "@/components/admin/FooterResourceManager";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import MemberManager from "@/components/admin/MemberManager";
import GameManager from "@/components/admin/GameManager";
import AdminManager from "@/components/admin/AdminManager";

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [adminStatus, setAdminStatus] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .eq('is_active', true)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        setAdminStatus(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin permissions",
          variant: "destructive",
        });
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Errore durante il logout",
        description: "Si è verificato un problema durante il logout",
        variant: "destructive",
      });
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jf-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D946EF]"></div>
      </div>
    );
  }

  if (!adminStatus) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-jf-dark">
          <div className="text-center text-white bg-black/40 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">You do not have permission to access this area.</p>
            <Button onClick={() => navigate("/")} className="bg-[#D946EF] hover:bg-[#D946EF]/90">Return to Home</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container pt-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="admin-dashboard-header">
            <h1 className="admin-dashboard-title">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="bg-black/30 text-white border-white/10 hover:bg-black/50 hover:border-white/20"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="bg-black/30 border-white/10 text-white hover:bg-white/10"
              >
                Back to Site
              </Button>
            </div>
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="admin-tabs-header">
              <TabsTrigger value="members" className="admin-tabs-trigger">
                Team Members
              </TabsTrigger>
              <TabsTrigger value="games" className="admin-tabs-trigger">
                Best Games
              </TabsTrigger>
              <TabsTrigger value="faqs" className="admin-tabs-trigger">
                FAQs
              </TabsTrigger>
              <TabsTrigger value="resources" className="admin-tabs-trigger">
                Resources
              </TabsTrigger>
              <TabsTrigger value="admins" className="admin-tabs-trigger">
                Users & Admins
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-6">
              <MemberManager />
            </TabsContent>
            
            <TabsContent value="games" className="mt-6">
              <GameManager />
            </TabsContent>
            
            <TabsContent value="faqs" className="mt-6">
              <FAQManager />
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6">
              <FooterResourceManager />
            </TabsContent>
            
            <TabsContent value="admins" className="mt-6">
              <AdminManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Admin;

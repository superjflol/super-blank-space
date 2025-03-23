import { useState, useEffect } from "react";
import { Github, Twitter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface FooterResource {
  id: string;
  title_it: string;
  title_en: string;
  url: string;
  category: string;
}

const Footer = () => {
  const { translations, locale } = useLanguage();
  const [resources, setResources] = useState<FooterResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("footer_resources")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true });

        if (error) throw error;
        setResources(data || []);
      } catch (error) {
        console.error("Error fetching footer resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();

    // Set up real-time listener for changes
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

  // Filter resources for links category (the ones to display in the resources section)
  const linkResources = resources.filter(resource => resource.category === "links");

  return (
    <footer id="resources" className="bg-jf-dark py-12 px-4 md:px-6 border-t border-white/10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="text-2xl font-display font-bold text-white">
                Judgment<span className="text-[#D946EF]">Fleet</span>
              </span>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 max-w-md">
                {translations.contactsFounder}
              </p>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-gray-400">paispaz</p>
              <p className="text-gray-400">vinn0558</p>
              <p className="text-gray-400">shootouts</p>
            </div>
            
            {/* Logo added below the founder contacts */}
            <div className="mt-8">
              <img 
                src="/assetsupload/0960f71e-449c-4316-b652-9cff4011d4f4.png" 
                alt="Judgment Fleet Logo" 
                className="h-auto max-h-24 w-auto"
              />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">{translations.resourcesSection}</h3>
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading resources...</span>
              </div>
            ) : linkResources.length > 0 ? (
              <div className="pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  {linkResources.map((resource) => (
                    <div key={resource.id} className="mb-2">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white transition-colors text-sm md:text-base truncate block"
                      >
                        {locale === 'it' ? resource.title_it : resource.title_en}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No resources available</p>
            )}
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Judgment Fleet. {translations.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

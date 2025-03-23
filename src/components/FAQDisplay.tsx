
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question_it: string;
  question_en: string;
  answer_it: string;
  answer_en: string;
  position: number;
}

interface FAQDisplayProps {
  faqItems?: { question: string; answer: string; }[];
}

const FAQDisplay: React.FC<FAQDisplayProps> = () => {
  const { translations, locale } = useLanguage();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true });
        
        if (error) throw error;
        
        setFaqItems(data || []);
      } catch (err: any) {
        console.error("Error fetching FAQs:", err);
        setError(err.message || "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
    
    // Set up real-time subscription for changes
    const subscription = supabase
      .channel('faqs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'faqs',
      }, () => {
        console.log('FAQs data changed, refreshing...');
        fetchFAQs();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderAnswer = (answer: string) => {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            a: ({ ...props }) => (
              <a 
                {...props} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-500 hover:text-pink-400" 
              />
            ),
            img: ({ ...props }) => (
              <img 
                {...props} 
                className="my-4 rounded-lg" 
                loading="lazy" 
              />
            ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    );
  };

  // Removed the loading animation and directly show the FAQs
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center py-20"
      >
        <p className="text-red-500">{error}</p>
      </motion.div>
    );
  }

  if (faqItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center py-20"
      >
        <p className="text-gray-400">{translations.noFaqsAvailable}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-8 w-8 text-[#D946EF]" />
        <h1 className="text-4xl md:text-5xl font-display font-bold">
          {translations.faqTitle}
        </h1>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqItems.map((item, index) => (
          <AccordionItem 
            key={item.id} 
            value={`item-${index}`} 
            className="bg-jf-gray/30 border border-white/10 rounded-lg px-6 overflow-hidden"
          >
            <AccordionTrigger className="text-xl font-medium py-5 hover:no-underline">
              {locale === 'it' ? item.question_it : item.question_en}
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              {renderAnswer(locale === 'it' ? item.answer_it : item.answer_en)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
};

export default FAQDisplay;

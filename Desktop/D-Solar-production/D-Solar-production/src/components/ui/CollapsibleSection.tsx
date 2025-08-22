import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps { 
  title: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ 
  title, 
  icon, 
  children,
  defaultOpen = false
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  
  return (
    <div className="mt-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
      >
        <span className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
          {icon}
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection; 
'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Search, Filter, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageIllustration } from './message-illustration';

interface MessagesEmptyStateProps {
  searchQuery?: string;
  activeFilter?: string;
  onStartConversation?: () => void;
}

export function MessagesEmptyState({
  searchQuery,
  activeFilter,
  onStartConversation,
}: MessagesEmptyStateProps) {
  // Determine content based on context
  const getContent = () => {
    if (searchQuery) {
      return {
        title: 'No conversations found',
        subtitle: `We couldn't find any conversations matching "${searchQuery}". Try adjusting your search terms.`,
        icon: Search,
        showIllustration: false,
        showCTA: false,
      };
    }

    if (activeFilter && activeFilter !== 'all') {
      const filterLabel = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
      return {
        title: `No ${filterLabel.toLowerCase()} messages`,
        subtitle: `There are no conversations with this filter. Try selecting a different filter or start a new conversation.`,
        icon: Filter,
        showIllustration: false,
        showCTA: false,
      };
    }

    return {
      title: 'No messages yet',
      subtitle: 'Your conversations will appear here once you start chatting.',
      icon: MessageSquare,
      showIllustration: true,
      showCTA: true,
    };
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      {/* Show illustration only for main empty state */}
      {content.showIllustration ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <MessageIllustration className="w-64 h-48 md:w-72 md:h-54" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
        >
          <Icon className="h-8 w-8 text-gray-400" />
        </motion.div>
      )}

      {/* Title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-gray-600 font-medium"
      >
        {content.title}
      </motion.p>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="text-gray-400 text-sm mt-1 max-w-md"
      >
        {content.subtitle}
      </motion.p>

      {/* CTA Button */}
      {content.showCTA && onStartConversation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={onStartConversation}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full px-6 h-10 font-medium shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Start a Conversation
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

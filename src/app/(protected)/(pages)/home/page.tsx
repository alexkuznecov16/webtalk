'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../../sidebar/Sidebar';
import Content, { type ChatMessage } from '../../content/Content';
import styles from './page.module.scss';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const pendingOptimisticIdsRef = useRef<string[]>([]);

  const {
    profile,
    chats,
    getChats,
    accounts,
    getAccounts,
    user,
    initialized,
    getMessages,
    sendMessage,
    createChatWithUser,
    clearChatUnread,
    setActiveChatId,
  } = useDatabase();

  const myUserId = user?.id ?? '';

  useEffect(() => {
    if (!selectedChatId) return;

    const channel = supabase
      .channel(`chat:${selectedChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage & { chat_id?: string };

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;

            if (newMessage.sender_id === myUserId && pendingOptimisticIdsRef.current.length > 0) {
              const optimisticId = pendingOptimisticIdsRef.current[0];

              const hasOptimistic = prev.some((msg) => msg.id === optimisticId);
              if (hasOptimistic) {
                pendingOptimisticIdsRef.current.shift();

                return prev.map((msg) => (msg.id === optimisticId ? newMessage : msg));
              }
            }

            return [...prev, newMessage];
          });

          clearChatUnread(selectedChatId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;

          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedChatId, myUserId, clearChatUnread]);

  useEffect(() => {
    void getAccounts();
  }, []);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const chatId = selectedChatId;

    async function loadMessages() {
      const data = await getMessages(chatId);
      setMessages(data);
      clearChatUnread(chatId);
    }

    void loadMessages();
  }, [selectedChatId, getMessages, clearChatUnread]);

  useEffect(() => {
    if (!initialized) return;
    if (!user?.id) return;

    void getChats();
  }, [initialized, user?.id]);

  useEffect(() => {
    const savedChatId = localStorage.getItem('selectedChatId');
    if (savedChatId) {
      setSelectedChatId(savedChatId);
    }
  }, []);

  useEffect(() => {
    setActiveChatId(selectedChatId);
  }, [selectedChatId]);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace('/');
    }
  }, [initialized, user, router]);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.chatId === selectedChatId) ?? null,
    [selectedChatId, chats]
  );

  const sidebarChats = useMemo(() => chats, [chats]);

  const handleSendMessage = async ({ text, file }: { text: string; file: File | null }) => {
    if (!selectedChatId || !myUserId) return;

    const trimmedText = text.trim();
    if (!trimmedText && !file) return;

    const optimisticId = `temp-${Date.now()}`;

    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      sender_id: myUserId,
      content: trimmedText || null,
      image_url: null,
      created_at: new Date().toISOString(),
    };

    pendingOptimisticIdsRef.current.push(optimisticId);
    setMessages((prev) => [...prev, optimisticMessage]);

    const result = await sendMessage({
      chatId: selectedChatId,
      sender_id: myUserId,
      content: trimmedText || null,
      image_url: null,
    });

    if (result.error) {
      console.error(result.error);

      pendingOptimisticIdsRef.current = pendingOptimisticIdsRef.current.filter(
        (id) => id !== optimisticId
      );

      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      return;
    }
  };

  const handleSelectChat = (chatId: string) => {
    localStorage.setItem('selectedChatId', chatId);
    setSelectedChatId(chatId);
    setActiveChatId(chatId);
    clearChatUnread(chatId);
  };

  const handleCloseChat = () => {
    localStorage.removeItem('selectedChatId');
    setSelectedChatId(null);
    setActiveChatId(null);
  };

  if (!initialized) return null;
  if (!user) return null;

  return (
    <div className={`${styles.chatPage} ${selectedChatId ? styles.hasActiveChat : ''}`}>
      <div className={styles.sidebarSection}>
        <Sidebar
          myInfo={profile}
          accounts={accounts}
          chats={sidebarChats}
          activeChatId={selectedChatId || undefined}
          onSelectChat={(chat) => handleSelectChat(chat.chatId)}
          onSelectAccount={async (account) => {
            const result = await createChatWithUser(account.id);

            if (result.error) {
              console.error(result.error);
              return;
            }

            if (result.chatId) {
              await getChats();
              handleSelectChat(result.chatId);
            }
          }}
        />
      </div>

      <div className={styles.contentSection}>
        <Content
          participant={selectedChat?.participant}
          currentUserId={myUserId}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => handleCloseChat()}
        />
      </div>
    </div>
  );
}

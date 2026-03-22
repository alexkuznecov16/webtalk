'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type ChatParticipantType = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
};

type ChatLastMessageType = {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

type MessageType = {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

type ChatItemType = {
  chatId: string;
  participant: ChatParticipantType;
  lastMessage: ChatLastMessageType | null;
  unreadcount: number;
};

type UserType = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
} | null;

type ProfileType = {
  id: string;
  email: string | null;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
} | null;

type AccountType = {
  id: string;
  email: string | null;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
};

type DatabaseContextType = {
  chats: ChatItemType[];
  accounts: AccountType[];
  user: UserType;
  profile: ProfileType;
  initialized: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  clearChatUnread: (chatId: string) => void;
  getChats: () => Promise<ChatItemType[]>;
  getAccounts: () => Promise<AccountType[]>;
  getMessages: (chatId: string) => Promise<MessageType[]>;
  sendMessage: (params: {
    chatId: string;
    sender_id: string;
    content: string | null;
    image_url?: string | null;
  }) => Promise<{ error?: string }>;
  createChatWithUser: (otherUserId: string) => Promise<{ chatId?: string; error?: string }>;
  getCurrentUser: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatItemType[]>([]);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [user, setUser] = useState<UserType>(null);
  const [profile, setProfile] = useState<ProfileType>(null);
  const [initialized, setInitialized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, username, avatar_url, is_online, last_seen')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setProfile(data ?? null);
    } catch (error) {
      console.error('fetchProfile unexpected error:', error);
      setProfile(null);
    }
  }

  async function getAccounts() {
    try {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, username, avatar_url, is_online, last_seen')
        .neq('id', user.id);

      if (error) {
        console.error(error);
        setAccounts([]);
        return [];
      }

      const result = data ?? [];
      setAccounts(result);
      return result;
    } catch (error) {
      console.error('getAccounts unexpected error:', error);
      return [];
    }
  }

  async function getChats(): Promise<ChatItemType[]> {
    try {
      if (!user?.id) {
        setChats([]);
        return [];
      }

      const { data: participantRows, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id, profile_id')
        .eq('profile_id', user.id);

      if (participantError) {
        console.error('getChats participant error:', participantError);
        setChats([]);
        return [];
      }

      const chatIds = participantRows?.map((row) => row.chat_id) ?? [];

      if (chatIds.length === 0) {
        setChats([]);
        return [];
      }

      const results = await Promise.all(
        chatIds.map(async (chatId) => {
          const { data: chatParticipants, error: chatParticipantsError } = await supabase
            .from('chat_participants')
            .select(
              `
              profile_id,
              profiles (
                id,
                name,
                username,
                avatar_url,
                is_online,
                last_seen
              )
              `
            )
            .eq('chat_id', chatId);

          if (chatParticipantsError) {
            console.error('getChats chatParticipants error:', chatParticipantsError);
            return null;
          }

          const otherParticipantRow = chatParticipants?.find((item) => item.profile_id !== user.id);

          const otherParticipant = Array.isArray(otherParticipantRow?.profiles)
            ? otherParticipantRow.profiles[0]
            : otherParticipantRow?.profiles;

          if (!otherParticipant) {
            return null;
          }

          const { data: lastMessageRows, error: lastMessageError } = await supabase
            .from('messages')
            .select('id, sender_id, content, image_url, created_at')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (lastMessageError) {
            console.error('getChats lastMessage error:', lastMessageError);
            return null;
          }

          const lastMessage = lastMessageRows?.[0]
            ? {
                id: lastMessageRows[0].id,
                sender_id: lastMessageRows[0].sender_id,
                content: lastMessageRows[0].content,
                image_url: lastMessageRows[0].image_url,
                created_at: lastMessageRows[0].created_at,
              }
            : null;

          const isOpenNow = activeChatId === chatId;

          const { count: unreadcount, error: unreadError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chatId)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          if (unreadError) {
            console.error('getChats unreadcount error:', unreadError);
            return null;
          }

          return {
            chatId,
            participant: {
              id: otherParticipant.id,
              name: otherParticipant.name,
              username: otherParticipant.username,
              avatar_url: otherParticipant.avatar_url,
              is_online: otherParticipant.is_online,
              last_seen: otherParticipant.last_seen,
            },
            lastMessage,
            unreadcount: isOpenNow ? 0 : (unreadcount ?? 0),
          } satisfies ChatItemType;
        })
      );

      const normalizedChats = results
        .filter((chat): chat is ChatItemType => chat !== null)
        .sort((a, b) => {
          const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
          const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
          return bTime - aTime;
        });

      setChats(normalizedChats);
      return normalizedChats;
    } catch (error) {
      console.error('getChats unexpected error:', error);
      setChats([]);
      return [];
    }
  }

  async function getMessages(chatId: string): Promise<MessageType[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, content, image_url, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('getMessages error:', error);
        return [];
      }

      return data ?? [];
    } catch (error) {
      console.error('getMessages unexpected error:', error);
      return [];
    }
  }

  async function sendMessage({
    chatId,
    sender_id,
    content,
    image_url = null,
  }: {
    chatId: string;
    sender_id: string;
    content: string | null;
    image_url?: string | null;
  }): Promise<{ error?: string }> {
    try {
      const trimmedContent = content?.trim() ?? null;

      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id,
        content: trimmedContent,
        image_url,
      });

      if (error) {
        console.error('sendMessage error:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('sendMessage unexpected error:', error);
      return { error: 'Failed to send message' };
    }
  }

  async function createChatWithUser(
    otherUserId: string
  ): Promise<{ chatId?: string; error?: string }> {
    try {
      if (!user?.id) {
        return { error: 'User not authenticated' };
      }

      if (user.id === otherUserId) {
        return { error: 'Cannot create chat with yourself' };
      }

      const { data: myRows, error: myRowsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('profile_id', user.id);

      if (myRowsError) {
        console.error('createChatWithUser myRowsError:', myRowsError);
        return { error: myRowsError.message };
      }

      const myChatIds = (myRows ?? []).map((row) => row.chat_id);

      if (myChatIds.length > 0) {
        const { data: otherRows, error: otherRowsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('profile_id', otherUserId)
          .in('chat_id', myChatIds);

        if (otherRowsError) {
          console.error('createChatWithUser otherRowsError:', otherRowsError);
          return { error: otherRowsError.message };
        }

        const existingChatId = otherRows?.[0]?.chat_id;

        if (existingChatId) {
          return { chatId: existingChatId };
        }
      }

      const { data: createdChat, error: createChatError } = await supabase
        .from('chats')
        .insert({
          created_by: user.id,
        })
        .select('id')
        .single();

      if (createChatError || !createdChat) {
        console.error('createChatWithUser createChatError:', createChatError);
        return { error: createChatError?.message ?? 'Failed to create chat' };
      }

      const { error: participantsError } = await supabase.from('chat_participants').insert([
        {
          chat_id: createdChat.id,
          profile_id: user.id,
        },
        {
          chat_id: createdChat.id,
          profile_id: otherUserId,
        },
      ]);

      if (participantsError) {
        console.error('createChatWithUser participantsError:', participantsError);
        return { error: participantsError.message };
      }

      await getChats();

      return { chatId: createdChat.id };
    } catch (error) {
      console.error('createChatWithUser unexpected error:', error);
      return { error: 'Failed to create chat' };
    }
  }

  async function getCurrentUser() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('getCurrentUser error:', error.message);
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session?.user ?? null);
    } catch (error) {
      console.error('getCurrentUser unexpected error:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setInitialized(true);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    void fetchProfile(user.id);
  }, [user?.id]);

  useEffect(() => {
    void getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(identifier: string, password: string) {
    setAuthLoading(true);

    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = cleanIdentifier.includes('@');

    if (isEmail) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier,
        password,
      });

      if (error) {
        setAuthLoading(false);
        return { error: error.message };
      }

      setUser(data.user);
      await updateMyOnlineStatus(data.user.id);
      await fetchProfile(data.user.id);
      setAuthLoading(false);
      return {};
    }

    const normalizedUsername = cleanIdentifier.replace(/^@/, '');

    const { data: foundProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', normalizedUsername)
      .maybeSingle();

    if (profileError || !foundProfile?.email) {
      setAuthLoading(false);
      return { error: 'User with this username was not found' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: foundProfile.email,
      password,
    });

    if (error) {
      setAuthLoading(false);
      return { error: error.message };
    }

    setUser(data.user);
    await updateMyOnlineStatus(data.user.id);
    await fetchProfile(data.user.id);
    setAuthLoading(false);
    return {};
  }

  async function signUp(name: string, email: string, password: string) {
    setAuthLoading(true);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
        },
      },
    });

    setAuthLoading(false);

    if (error) {
      return { error: error.message };
    }

    return {};
  }

  async function signOut() {
    setAuthLoading(true);

    if (user?.id) {
      await updateMyOnlineStatus(user.id);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthLoading(false);
      return { error: error.message };
    }

    setUser(null);
    setProfile(null);
    setAuthLoading(false);
    return {};
  }

  function upsertChatPreviewFromMessage(message: {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string | null;
    image_url: string | null;
    created_at: string;
  }) {
    setChats((prevChats) => {
      const updated = prevChats.map((chat) => {
        if (chat.chatId !== message.chat_id) return chat;

        const isIncoming = message.sender_id !== user?.id;
        const isActiveChat = activeChatId === message.chat_id;

        return {
          ...chat,
          lastMessage: {
            id: message.id,
            sender_id: message.sender_id,
            content: message.content,
            image_url: message.image_url,
            created_at: message.created_at,
          },
          unreadcount:
            isIncoming && !isActiveChat
              ? chat.unreadcount + 1
              : isActiveChat
                ? 0
                : chat.unreadcount,
        };
      });

      return [...updated].sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
    });
  }

  function clearChatUnread(chatId: string) {
    setChats((prev) =>
      prev.map((chat) =>
        chat.chatId === chatId
          ? {
              ...chat,
              unreadcount: 0,
            }
          : chat
      )
    );
  }

  async function updateMyOnlineStatus(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('updateMyOnlineStatus error:', error);
      }
    } catch (error) {
      console.error('updateMyOnlineStatus unexpected error:', error);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      void updateMyOnlineStatus(user.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!initialized || !user?.id) return;

    const channel = supabase
      .channel(`profiles-live-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedProfile = payload.new as {
            id: string;
            last_seen: string | null;
            is_online: boolean;
          };

          setChats((prev) =>
            prev.map((chat) =>
              chat.participant.id === updatedProfile.id
                ? {
                    ...chat,
                    participant: {
                      ...chat.participant,
                      last_seen: updatedProfile.last_seen,
                      is_online: updatedProfile.is_online,
                    },
                  }
                : chat
            )
          );

          setAccounts((prev) =>
            prev.map((account) =>
              account.id === updatedProfile.id
                ? {
                    ...account,
                    last_seen: updatedProfile.last_seen,
                    is_online: updatedProfile.is_online,
                  }
                : account
            )
          );

          setProfile((prev) =>
            prev && prev.id === updatedProfile.id
              ? {
                  ...prev,
                  last_seen: updatedProfile.last_seen,
                  is_online: updatedProfile.is_online,
                }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initialized, user?.id]);

  const value = useMemo(
    () => ({
      clearChatUnread,
      chats,
      accounts,
      getChats,
      getAccounts,
      getMessages,
      sendMessage,
      createChatWithUser,
      user,
      profile,
      initialized,
      authLoading,
      isAuthenticated: !!user,
      getCurrentUser,
      signIn,
      signUp,
      signOut,
      activeChatId,
      setActiveChatId,
    }),
    [chats, accounts, user, profile, initialized, authLoading, activeChatId]
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error('useDatabase must be used inside DatabaseProvider');
  }

  return context;
}

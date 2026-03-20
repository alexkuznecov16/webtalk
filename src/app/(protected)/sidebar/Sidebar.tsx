import Image from 'next/image';
import styles from './Sidebar.module.scss';
import Search, { type SearchParticipant } from '@/app/components/search/Search';

export type SidebarParticipant = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
};

export type SidebarLastMessage = {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

export type SidebarChatItem = {
  chatId: string;
  participant: SidebarParticipant;
  lastMessage: SidebarLastMessage | null;
  unreadcount: number;
};

type SidebarMyInfo = {
  id: string;
  email: string | null;
  name: string;
  username: string;
  avatar_url: string | null;
} | null;

type SidebarProps = {
  myInfo: SidebarMyInfo;
  accounts: SearchParticipant[];
  chats: SidebarChatItem[];
  activeChatId?: string;
  onSelectChat?: (chat: SidebarChatItem) => void;
  onSelectAccount?: (account: SearchParticipant) => void;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function formatMessagePreview(message: SidebarLastMessage | null) {
  if (!message) return 'No messages yet';
  if (message.content?.trim()) return message.content;
  if (message.image_url) return '📷 Image';
  return 'Empty message';
}

function formatMessageTime(dateString: string | undefined) {
  if (!dateString) return '';

  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function Sidebar({
  myInfo,
  accounts,
  chats,
  activeChatId,
  onSelectChat,
  onSelectAccount,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.topbar}>
        <div>
          <h2 className={styles.title}>Messages</h2>
          <p className={styles.subtitle}>Your chats</p>
        </div>

        <div className={styles.profileBadge}>
          <div className={styles.avatarWrap}>
            {myInfo?.avatar_url ? (
              <Image
                width={56}
                height={56}
                src={myInfo.avatar_url}
                alt={myInfo.name}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarFallback}>{getInitials(myInfo?.name ?? 'Me')}</div>
            )}
          </div>

          <span className={styles.chatUsername}>@{myInfo?.username ?? 'me'}</span>
        </div>
      </div>

      <Search
        accounts={accounts}
        onSelect={(account) => {
          const selectedChat = chats.find(
            (chat) =>
              chat.participant.id === account.id || chat.participant.username === account.username
          );

          if (selectedChat) {
            onSelectChat?.(selectedChat);
            return;
          }

          onSelectAccount?.(account);
        }}
      />

      <div className={styles.chatList}>
        {chats.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No chats yet</p>
            <span>Create a conversation to start messaging</span>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = chat.chatId === activeChatId;

            return (
              <button
                key={chat.chatId}
                type="button"
                className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''}`}
                onClick={() => onSelectChat?.(chat)}
              >
                <div className={styles.avatarWrap}>
                  {chat.participant.avatar_url ? (
                    <Image
                      width={100}
                      height={100}
                      src={chat.participant.avatar_url}
                      alt={chat.participant.name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {getInitials(chat.participant.name)}
                    </div>
                  )}
                </div>

                <div className={styles.chatContent}>
                  <div className={styles.chatRowTop}>
                    <div className={styles.chatMeta}>
                      <h3 className={styles.chatTitle}>{chat.participant.name}</h3>
                      <span className={styles.chatUsername}>@{chat.participant.username}</span>
                    </div>

                    <div className={styles.chatInfoSide}>
                      {chat.lastMessage && (
                        <span className={styles.chatTime}>
                          {formatMessageTime(chat.lastMessage.created_at)}
                        </span>
                      )}

                      {chat.unreadcount > 0 && (
                        <div className={styles.unreadBadge}>
                          {chat.unreadcount > 9 ? '9+' : chat.unreadcount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.chatRowBottom}>
                    <p className={styles.lastMessage}>{formatMessagePreview(chat.lastMessage)}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

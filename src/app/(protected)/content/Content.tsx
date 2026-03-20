import { ChangeEvent, FormEvent, useEffect, useRef, useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import styles from './Content.module.scss';

type ChatParticipant = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
};

export type ChatMessage = {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

type ContentProps = {
  participant?: ChatParticipant | null;
  currentUserId: string;
  messages?: ChatMessage[];
  onSendMessage?: (payload: { text: string; file: File | null }) => void;
  onBack?: () => void;
};

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

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

export default function Content({
  participant,
  currentUserId,
  messages = [],
  onSendMessage,
  onBack,
}: ContentProps) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (!messagesAreaRef.current) return;

    messagesAreaRef.current.scrollTo({
      top: messagesAreaRef.current.scrollHeight,
      behavior,
    });
  };

  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [participant?.id]);

  useEffect(() => {
    const isFirstLoadForChat = prevMessagesLengthRef.current === 0;
    const behavior: ScrollBehavior = isFirstLoadForChat ? 'auto' : 'smooth';

    const frame = requestAnimationFrame(() => {
      scrollToBottom(behavior);
      prevMessagesLengthRef.current = messages.length;
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, participant?.id]);

  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [participant?.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToBottom('auto');
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, participant?.id]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleDownload = async (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();

    try {
      const response = await fetch(imageUrl, { cache: 'force-cache' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      const filename = imageUrl.split('/').pop() || 'image.' + blob.type;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imageUrl, '_blank');
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setSelectedFile(file);
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText && !selectedFile) return;

    onSendMessage?.({
      text: trimmedText,
      file: selectedFile,
    });

    setText('');
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!participant) {
    return (
      <section className={styles.contentEmpty}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>💬</div>
          <h2>Select a chat</h2>
          <p>Choose a conversation on the left to start messaging</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.content}>
      <header className={styles.topbar}>
        <div className={styles.userBlock}>
          <div className={styles.avatarWrap}>
            {participant.avatar_url ? (
              <Image
                src={participant.avatar_url}
                alt={participant.name}
                width={56}
                height={56}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarFallback}>{getInitials(participant.name)}</div>
            )}
          </div>

          <div className={styles.userMeta}>
            <h2 className={styles.userName}>{participant.name}</h2>
            <p className={styles.userUsername}>@{participant.username}</p>
          </div>
        </div>

        <div className={styles.topbarActions}>
          {/* <button type="button" className={styles.iconButton}>
            ☎
          </button>
          <button type="button" className={styles.iconButton}>
            ⋮
          </button> */}
          <button onClick={onBack} className={styles.mobileBack} type="button">
            X
          </button>
        </div>
      </header>

      <div className={styles.messagesArea} ref={messagesAreaRef}>
        {messages.length === 0 ? (
          <div className={styles.chatPlaceholder}>
            <span>Start your conversation</span>
            <p>Send a text message or attach a photo from your gallery</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMine = message.sender_id === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`${styles.messageRow} ${isMine ? styles.messageRowMine : ''}`}
                >
                  <div
                    className={`${styles.messageBubble} ${isMine ? styles.messageBubbleMine : ''}`}
                  >
                    {message.image_url ? (
                      <div className={styles.messageImageWrap}>
                        <div className={styles.imageContainer}>
                          <Image
                            src={message.image_url}
                            alt="Message image"
                            width={500}
                            height={320}
                            className={styles.messageImage}
                          />
                          <span onClick={(e) => handleDownload(e, message.image_url)}>
                            ⬇ Download
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {message.content?.trim() ? (
                      <p className={styles.messageText}>{message.content}</p>
                    ) : null}

                    <span className={styles.messageTime}>{formatTime(message.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className={styles.composerWrap}>
        {previewUrl ? (
          <div className={styles.previewCard}>
            <div className={styles.previewImageWrap}>
              <Image
                src={previewUrl}
                alt="Preview"
                width={180}
                height={140}
                className={styles.previewImage}
              />
            </div>

            <div className={styles.previewMeta}>
              <span className={styles.previewTitle}>{selectedFile?.name}</span>
              <span className={styles.previewSubtitle}>Ready to send</span>
            </div>

            <button
              type="button"
              className={styles.removePreviewButton}
              onClick={removeSelectedImage}
            >
              ✕
            </button>
          </div>
        ) : null}

        <form className={styles.composer} onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={styles.attachButton}
            onClick={handlePickImage}
            aria-label="Attach image"
          >
            📎
          </button>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a message..."
            className={styles.textarea}
            rows={1}
          />

          <button
            type="submit"
            className={styles.sendButton}
            disabled={!text.trim() && !selectedFile}
          >
            ➤
          </button>
        </form>
      </div>
    </section>
  );
}

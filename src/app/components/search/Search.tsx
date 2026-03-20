'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './Search.module.scss';

export type SearchParticipant = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
};

type SearchProps = {
  accounts: SearchParticipant[];
  onSelect?: (account: SearchParticipant) => void;
  placeholder?: string;
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

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

export default function Search({
  accounts,
  onSelect,
  placeholder = 'Search by name or @username',
}: SearchProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalizeUsername(query);

  const filteredAccounts = useMemo(() => {
    if (!normalizedQuery || !accounts) return [];

    return accounts.filter((account) => {
      const username = account.username.toLowerCase();
      const name = account.name.toLowerCase();

      return username.includes(normalizedQuery) || name.includes(normalizedQuery);
    });
  }, [accounts, normalizedQuery]);

  const hasResults = filteredAccounts.length > 0;
  const showDropdown = query.trim().length > 0;

  return (
    <div className={styles.search}>
      <div className={styles.searchWrap}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={styles.searchInput}
        />
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {hasResults ? (
            <div className={styles.resultsList}>
              {filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => {
                    onSelect?.(account);
                  }}
                >
                  <div className={styles.avatarWrap}>
                    {account.avatar_url ? (
                      <Image
                        src={account.avatar_url}
                        alt={account.name}
                        width={48}
                        height={48}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>{getInitials(account.name)}</div>
                    )}
                  </div>

                  <div className={styles.resultMeta}>
                    <h4 className={styles.name}>{account.name}</h4>
                    <span className={styles.username}>@{account.username}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>User not found</p>
              <span>Try enter other nickname or name</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

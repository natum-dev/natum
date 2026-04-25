"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Modal } from "../Modal";
import { SearchInput } from "../SearchInput";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Spinner } from "../Spinner";
import { Typography } from "../Typography";
import { IconX, IconCheck, IconChevronDown } from "@natum/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../DropdownMenu";
import { PermissionBadge } from "../PermissionBadge";
import type { PermissionLevel } from "../PermissionBadge";
import styles from "./ShareDialog.module.scss";
import cx from "classnames";

export type ShareUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type ShareEntry = ShareUser & {
  level: PermissionLevel;
};

export type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  shares: ShareEntry[];
  onSearch: (query: string) => Promise<ShareUser[]>;
  onAdd: (user: ShareUser, level: PermissionLevel) => void;
  onPermissionChange: (userId: string, level: PermissionLevel) => void;
  onRemove: (userId: string) => void;
  defaultLevel?: PermissionLevel;
  className?: string;
};

const ShareDialog = forwardRef<HTMLDivElement, ShareDialogProps>(
  (
    {
      open,
      onClose,
      title,
      shares,
      onSearch,
      onAdd,
      onPermissionChange,
      onRemove,
      defaultLevel = "viewer",
      className,
    },
    ref
  ) => {
    const autoId = useId();
    const listboxId = `${autoId}-listbox`;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ShareUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [stagedUser, setStagedUser] = useState<ShareUser | null>(null);
    const [selectedLevel, setSelectedLevel] =
      useState<PermissionLevel>(defaultLevel);
    const [activeIndex, setActiveIndex] = useState(-1);

    const searchRef = useRef<HTMLInputElement>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
      if (!open) {
        setQuery("");
        setResults([]);
        setIsSearching(false);
        setStagedUser(null);
        setSelectedLevel(defaultLevel);
        setActiveIndex(-1);
      }
    }, [open, defaultLevel]);

    const filteredResults = results.filter(
      (user) => !shares.some((s) => s.id === user.id)
    );

    const showDropdown = !stagedUser && query.length > 0;

    const handleSearchChange = useCallback(
      async (value: string) => {
        setStagedUser(null);
        setQuery(value);
        if (!value.trim()) {
          setResults([]);
          setIsSearching(false);
          return;
        }
        setIsSearching(true);
        const requestId = ++requestIdRef.current;
        try {
          const data = await onSearch(value);
          if (requestId === requestIdRef.current) {
            setResults(data);
            setIsSearching(false);
            setActiveIndex(-1);
          }
        } catch {
          if (requestId === requestIdRef.current) {
            setResults([]);
            setIsSearching(false);
          }
        }
      },
      [onSearch]
    );

    const handleSelectResult = useCallback((user: ShareUser) => {
      setStagedUser(user);
      setQuery(user.name);
      setResults([]);
      setActiveIndex(-1);
    }, []);

    const handleAdd = useCallback(() => {
      if (!stagedUser) return;
      onAdd(stagedUser, selectedLevel);
      setStagedUser(null);
      setQuery("");
      setResults([]);
    }, [stagedUser, selectedLevel, onAdd]);

    const showDropdownRef = useRef(false);
    showDropdownRef.current = showDropdown;
    const filteredResultsRef = useRef<ShareUser[]>([]);
    filteredResultsRef.current = filteredResults;

    // When the search dropdown is open, Escape closes ONLY the dropdown;
    // event.preventDefault() suppresses the Modal close.
    const handleModalEscape = useCallback((event: globalThis.KeyboardEvent) => {
      if (!showDropdownRef.current || filteredResultsRef.current.length === 0)
        return;
      event.preventDefault();
      setResults([]);
      setQuery("");
      setActiveIndex(-1);
    }, []);

    const handleSearchKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (stagedUser && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setStagedUser(null);
        }

        if (!showDropdown || filteredResults.length === 0) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredResults.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filteredResults.length - 1
          );
        } else if (e.key === "Enter" && activeIndex >= 0) {
          e.preventDefault();
          handleSelectResult(filteredResults[activeIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setResults([]);
          setQuery("");
          setActiveIndex(-1);
        }
      },
      [stagedUser, showDropdown, filteredResults, activeIndex, handleSelectResult]
    );

    const levelLabel = (level: PermissionLevel) =>
      level === "editor" ? "Editor" : "Viewer";

    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        title={`Share "${title}"`}
        size="md"
        onEscapeKeyDown={handleModalEscape}
        className={cx(styles.share_dialog, className)}
      >
        {/* Add row */}
        <div className={styles.add_row}>
          <div className={styles.search_container}>
            <SearchInput
              ref={searchRef}
              value={query}
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              aria-label="Search users"
              role="combobox"
              aria-expanded={
                showDropdown && (isSearching || filteredResults.length > 0)
              }
              aria-controls={showDropdown ? listboxId : undefined}
              aria-activedescendant={
                activeIndex >= 0
                  ? `${autoId}-option-${filteredResults[activeIndex]?.id}`
                  : undefined
              }
              onKeyDown={handleSearchKeyDown}
              debounceMs={250}
            />

            {showDropdown && (
              <div
                className={styles.search_dropdown}
                id={listboxId}
                role="listbox"
                aria-label="Search results"
              >
                {isSearching && (
                  <div className={styles.search_status}>
                    <Spinner size="sm" label="Searching..." />
                  </div>
                )}
                {!isSearching && filteredResults.length === 0 && (
                  <div className={styles.search_status}>
                    <Typography variant="body2" color="secondary">
                      No users found
                    </Typography>
                  </div>
                )}
                {!isSearching &&
                  filteredResults.map((user, index) => (
                    <div
                      key={user.id}
                      id={`${autoId}-option-${user.id}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={cx(styles.search_result, {
                        [styles.search_result_active]: index === activeIndex,
                      })}
                      onClick={() => handleSelectResult(user)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="sm"
                        color="auto"
                      />
                      <div className={styles.user_info}>
                        <span className={styles.user_name}>{user.name}</span>
                        <span className={styles.user_email}>{user.email}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <button type="button" className={styles.permission_trigger}>
                {levelLabel(selectedLevel)}
                <IconChevronDown size="xs" color="currentColor" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => setSelectedLevel("editor")}
                leftSection={
                  selectedLevel === "editor" ? (
                    <IconCheck size="sm" color="currentColor" />
                  ) : undefined
                }
              >
                Editor
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setSelectedLevel("viewer")}
                leftSection={
                  selectedLevel === "viewer" ? (
                    <IconCheck size="sm" color="currentColor" />
                  ) : undefined
                }
              >
                Viewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="filled" disabled={!stagedUser} onClick={handleAdd}>
            Share
          </Button>
        </div>

        {/* Share list */}
        {shares.length > 0 && (
          <div className={styles.share_list}>
            <div className={styles.share_list_label}>People with access</div>
            {shares.map((entry) => (
              <div key={entry.id} className={styles.share_row}>
                <Avatar
                  src={entry.avatarUrl}
                  name={entry.name}
                  size="sm"
                  color="auto"
                />
                <div className={styles.user_info}>
                  <span className={styles.user_name}>{entry.name}</span>
                  <span className={styles.user_email}>{entry.email}</span>
                </div>
                {entry.level === "owner" ? (
                  <PermissionBadge level="owner" />
                ) : (
                  <div className={styles.share_actions}>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button
                          type="button"
                          className={styles.permission_trigger}
                        >
                          {levelLabel(entry.level)}
                          <IconChevronDown size="xs" color="currentColor" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() =>
                            onPermissionChange(entry.id, "editor")
                          }
                          leftSection={
                            entry.level === "editor" ? (
                              <IconCheck size="sm" color="currentColor" />
                            ) : undefined
                          }
                        >
                          Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            onPermissionChange(entry.id, "viewer")
                          }
                          leftSection={
                            entry.level === "viewer" ? (
                              <IconCheck size="sm" color="currentColor" />
                            ) : undefined
                          }
                        >
                          Viewer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <IconButton
                      icon={IconX}
                      aria-label={`Remove access for ${entry.name}`}
                      variant="text"
                      color="secondary"
                      size="small"
                      onClick={() => onRemove(entry.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    );
  }
);

ShareDialog.displayName = "ShareDialog";

export { ShareDialog };

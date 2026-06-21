"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SavedItemInput } from "@faden/validators";
import {
  clearLocalSavedItems,
  readLocalSavedItems,
  writeLocalSavedItems,
} from "@/lib/saved-items/local-storage";
import {
  inputFromSavedItem,
  mergeSavedItems,
  savedItemKey,
  toLocalSavedItem,
  type SavedItem,
  type SavedListKind,
} from "@/lib/saved-items/types";
import { useUser } from "@/hooks/use-user";
import { isBrowserSupabaseConfigured } from "@/lib/supabase/client";

interface SavedItemsContextValue {
  wishlist: SavedItem[];
  cart: SavedItem[];
  ready: boolean;
  isSaved: (kind: SavedListKind, boutiqueSlug: string, designId?: string | null) => boolean;
  addItem: (kind: SavedListKind, input: SavedItemInput) => Promise<void>;
  removeItem: (kind: SavedListKind, boutiqueSlug: string, designId?: string | null) => Promise<void>;
  toggleItem: (kind: SavedListKind, input: SavedItemInput) => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

function getList(kind: SavedListKind, state: { wishlist: SavedItem[]; cart: SavedItem[] }) {
  return kind === "wishlist" ? state.wishlist : state.cart;
}

async function fetchRemoteItems(kind: SavedListKind): Promise<SavedItem[] | null> {
  const res = await fetch(`/api/${kind}`, { credentials: "same-origin" });
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: SavedItem[] };
  return data.items ?? [];
}

async function postRemoteItem(kind: SavedListKind, input: SavedItemInput): Promise<SavedItem | null> {
  const res = await fetch(`/api/${kind}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { item?: SavedItem };
  return data.item ?? null;
}

async function deleteRemoteItem(
  kind: SavedListKind,
  boutiqueSlug: string,
  designId?: string | null,
): Promise<boolean> {
  const params = new URLSearchParams({ boutiqueSlug });
  if (designId?.trim()) params.set("designId", designId.trim());
  const res = await fetch(`/api/${kind}?${params.toString()}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  return res.ok;
}

function itemsMissingFromRemote(local: SavedItem[], remote: SavedItem[] | null): SavedItem[] {
  return local.filter(
    (item) =>
      !remote?.some(
        (existing) =>
          savedItemKey(existing.boutiqueSlug, existing.designId) ===
          savedItemKey(item.boutiqueSlug, item.designId),
      ),
  );
}

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [lists, setLists] = useState({ wishlist: [] as SavedItem[], cart: [] as SavedItem[] });
  const [ready, setReady] = useState(false);
  const syncedForUser = useRef<string | null>(null);

  const storageUserId = user?.id ?? null;

  useEffect(() => {
    if (userLoading) return;

    setLists({
      wishlist: readLocalSavedItems("wishlist", storageUserId),
      cart: readLocalSavedItems("cart", storageUserId),
    });
    setReady(true);

    if (!user) {
      syncedForUser.current = null;
    } else if (syncedForUser.current !== user.id) {
      syncedForUser.current = null;
    }
  }, [user, userLoading, storageUserId]);

  useEffect(() => {
    if (!ready || userLoading) return;

    if (!user || !isBrowserSupabaseConfigured()) {
      return;
    }

    if (syncedForUser.current === user.id) return;

    let cancelled = false;
    const userId = user.id;

    void (async () => {
      const guestWishlist = readLocalSavedItems("wishlist", null);
      const guestCart = readLocalSavedItems("cart", null);
      const localWishlist = readLocalSavedItems("wishlist", userId);
      const localCart = readLocalSavedItems("cart", userId);

      const [remoteWishlist, remoteCart] = await Promise.all([
        fetchRemoteItems("wishlist"),
        fetchRemoteItems("cart"),
      ]);

      if (cancelled) return;

      const toUploadWishlist = itemsMissingFromRemote(
        mergeSavedItems(localWishlist, guestWishlist),
        remoteWishlist,
      );
      const toUploadCart = itemsMissingFromRemote(
        mergeSavedItems(localCart, guestCart),
        remoteCart,
      );

      await Promise.all([
        ...toUploadWishlist.map((item) => postRemoteItem("wishlist", inputFromSavedItem(item))),
        ...toUploadCart.map((item) => postRemoteItem("cart", inputFromSavedItem(item))),
      ]);

      if (cancelled) return;

      const [finalWishlist, finalCart] = await Promise.all([
        fetchRemoteItems("wishlist"),
        fetchRemoteItems("cart"),
      ]);

      const nextWishlist =
        finalWishlist ??
        mergeSavedItems(mergeSavedItems(remoteWishlist ?? [], localWishlist), guestWishlist);
      const nextCart =
        finalCart ?? mergeSavedItems(mergeSavedItems(remoteCart ?? [], localCart), guestCart);

      setLists({ wishlist: nextWishlist, cart: nextCart });
      writeLocalSavedItems("wishlist", nextWishlist, userId);
      writeLocalSavedItems("cart", nextCart, userId);
      clearLocalSavedItems("wishlist", null);
      clearLocalSavedItems("cart", null);
      syncedForUser.current = userId;
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, userLoading]);

  const isSaved = useCallback(
    (kind: SavedListKind, boutiqueSlug: string, designId?: string | null) => {
      const key = savedItemKey(boutiqueSlug, designId);
      return getList(kind, lists).some(
        (item) => savedItemKey(item.boutiqueSlug, item.designId) === key,
      );
    },
    [lists],
  );

  const addItem = useCallback(
    async (kind: SavedListKind, input: SavedItemInput) => {
      const key = savedItemKey(input.boutiqueSlug, input.designId);
      const localItem = toLocalSavedItem(input);

      setLists((prev) => {
        const current = getList(kind, prev);
        if (current.some((item) => savedItemKey(item.boutiqueSlug, item.designId) === key)) {
          return prev;
        }
        const next = [localItem, ...current];
        writeLocalSavedItems(kind, next, storageUserId);
        return kind === "wishlist" ? { ...prev, wishlist: next } : { ...prev, cart: next };
      });

      if (user && isBrowserSupabaseConfigured()) {
        const remote = await postRemoteItem(kind, input);
        if (remote) {
          setLists((prev) => {
            const current = getList(kind, prev);
            const next = mergeSavedItems(
              current.filter((item) => savedItemKey(item.boutiqueSlug, item.designId) !== key),
              [remote],
            );
            writeLocalSavedItems(kind, next, user.id);
            return kind === "wishlist" ? { ...prev, wishlist: next } : { ...prev, cart: next };
          });
        }
      }
    },
    [storageUserId, user],
  );

  const removeItem = useCallback(
    async (kind: SavedListKind, boutiqueSlug: string, designId?: string | null) => {
      const key = savedItemKey(boutiqueSlug, designId);

      setLists((prev) => {
        const next = getList(kind, prev).filter(
          (item) => savedItemKey(item.boutiqueSlug, item.designId) !== key,
        );
        writeLocalSavedItems(kind, next, storageUserId);
        return kind === "wishlist" ? { ...prev, wishlist: next } : { ...prev, cart: next };
      });

      if (user && isBrowserSupabaseConfigured()) {
        await deleteRemoteItem(kind, boutiqueSlug, designId);
      }
    },
    [storageUserId, user],
  );

  const toggleItem = useCallback(
    async (kind: SavedListKind, input: SavedItemInput) => {
      if (isSaved(kind, input.boutiqueSlug, input.designId)) {
        await removeItem(kind, input.boutiqueSlug, input.designId);
      } else {
        await addItem(kind, input);
      }
    },
    [addItem, isSaved, removeItem],
  );

  const value = useMemo(
    () => ({
      wishlist: lists.wishlist,
      cart: lists.cart,
      ready,
      isSaved,
      addItem,
      removeItem,
      toggleItem,
    }),
    [lists, ready, isSaved, addItem, removeItem, toggleItem],
  );

  return <SavedItemsContext.Provider value={value}>{children}</SavedItemsContext.Provider>;
}

export function useSavedItems() {
  const ctx = useContext(SavedItemsContext);
  if (!ctx) {
    throw new Error("useSavedItems must be used within SavedItemsProvider");
  }
  return ctx;
}

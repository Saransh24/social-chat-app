import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,
      isSendingText: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      // silent: used by the reconnect/foreground resync. Skips the loading skeleton and
      // the error toast so a routine catch-up never flashes the UI or nags on a flaky
      // connection - the visible message list simply updates in place.
      getMessages: async (userId, { silent = false } = {}) => {
        if (!userId) return;
        if (!silent) set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          if (!silent) toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          if (!silent) set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser } = get();
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          // read the list at settle time, not at call time - a socket event may have
          // appended to it while this request was in flight
          set((state) =>
            state.messages.some((m) => m._id === res.data._id)
              ? state
              : { messages: [...state.messages, res.data] },
          );
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      // One listener for the whole session, not one per open conversation. Scoping it to
      // the selected chat meant a message from anyone else was dropped on the floor and
      // the sidebar stayed stale until a refresh.
      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          const { selectedUser, users, conversations } = get();
          const isForOpenChat =
            selectedUser && String(newMessage.senderId) === String(selectedUser._id);

          if (isForOpenChat) {
            // a reconnect can replay an event we already have, so key off the id
            set((state) =>
              state.messages.some((m) => m._id === newMessage._id)
                ? state
                : { messages: [...state.messages, newMessage] },
            );
          } else {
            const sender =
              users.find((u) => String(u._id) === String(newMessage.senderId)) ||
              conversations.find((u) => String(u._id) === String(newMessage.senderId));

            const preview = newMessage.text || (newMessage.video ? "Sent a video" : "Sent a photo");
            toast(`${sender?.fullName ?? "New message"}: ${preview}`, { icon: "💬" });
          }

          // the sidebar has to reorder and surface brand-new chats either way
          get().getConversations();
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        // A send can take seconds on mobile. Without this guard a second tap fires a
        // second POST and the message is delivered twice.
        if (get().isSendingText) return false;

        // Clear the box up front rather than on success: the composer feels responsive,
        // and a second tap finds nothing left to send. Restored below if the send fails.
        set({ isSendingText: true, composerText: "" });

        try {
          const didSend = await get().sendMessage({ text: messageText });
          if (!didSend) set({ composerText: messageText });
          return didSend;
        } finally {
          set({ isSendingText: false });
        }
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "social-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);

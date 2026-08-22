import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";

function ChatPage() {
  const { frameStyle } = useWallpaper();

  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);

  // subscribeToMessages needs a live socket; if it is still connecting it bails out.
  // Depending on it here re-runs the effect once the socket exists, so the listener
  // is never silently skipped.
  const socket = useAuthStore((state) => state.socket);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
  }, [getConversations, getUsers]);

  useEffect(() => {
    if (!activeConversationId) return;

    getMessages(activeConversationId);
    subscribeToMessages(activeConversationId);

    // cleanup
    return () => unsubscribeFromMessages();
  }, [getMessages, activeConversationId, subscribeToMessages, unsubscribeFromMessages, socket]);

  // The server only emits to sockets that are connected at that instant - there is no
  // offline queue. Anything sent while this device was asleep, backgrounded or off the
  // network is stored in the database but never pushed here. So whenever we come back,
  // resync from the API instead of waiting for a socket event that will never arrive.
  useEffect(() => {
    if (!activeConversationId) return;

    const resync = () => {
      getMessages(activeConversationId, { silent: true });
      getConversations();
    };

    // fires on every successful (re)connect, including automatic reconnects
    socket?.on("connect", resync);

    // mobile browsers freeze background tabs and may restore without a socket event,
    // so returning to the foreground is its own trigger
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") resync();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      socket?.off("connect", resync);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [socket, activeConversationId, getMessages, getConversations]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8" style={frameStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        <ChatSidebar />

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatHeader />
          <MessageList />

          {activeConversation ? <ChatComposer /> : null}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;

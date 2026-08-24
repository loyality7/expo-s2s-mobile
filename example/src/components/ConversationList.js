import { useRef, useEffect } from 'react';
import { FlatList } from 'react-native';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { EmptyConversation } from './EmptyConversation';
import { spacing } from '../theme/theme';

export function ConversationList({ messages }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, messages[messages.length - 1]?.text]);

  if (messages.length === 0) return <EmptyConversation />;

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: spacing.md, flexGrow: 1 }}
      renderItem={({ item }) =>
        item.role === 'user' ? (
          <UserMessage text={item.text} pending={item.pending} />
        ) : (
          <AssistantMessage text={item.text} streaming={item.streaming} interrupted={item.interrupted} />
        )
      }
    />
  );
}

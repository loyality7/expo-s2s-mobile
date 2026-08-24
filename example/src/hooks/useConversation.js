import { useCallback, useEffect, useRef, useState } from 'react';
import { addS2SListener } from 'expo-s2s-mobile';

let idCounter = 0;
const nextId = () => `msg_${++idCounter}_${Date.now()}`;

/**
 * Builds the on-screen transcript from native events. AssistantDelta
 * updates ONE active assistant message in place — never a new bubble per
 * token. AssistantDone commits it; BargeIn marks it cut off, not deleted.
 */
export function useConversation() {
  const [messages, setMessages] = useState([]);
  const activeAssistantId = useRef(null);
  const activePartialUserId = useRef(null);

  const reset = useCallback(() => {
    setMessages([]);
    activeAssistantId.current = null;
    activePartialUserId.current = null;
  }, []);

  useEffect(() => {
    const subs = [
      addS2SListener('onUserTranscript', ({ text, isFinal }) => {
        setMessages((prev) => {
          if (activePartialUserId.current) {
            return prev.map((m) =>
              m.id === activePartialUserId.current ? { ...m, text } : m
            );
          }
          const id = nextId();
          activePartialUserId.current = isFinal ? null : id;
          return [...prev, { id, role: 'user', text, pending: !isFinal }];
        });
        if (isFinal) {
          activePartialUserId.current = null;
          setMessages((prev) => prev.map((m) => ({ ...m, pending: false })));
        }
      }),

      addS2SListener('onAssistantDelta', ({ text }) => {
        setMessages((prev) => {
          if (activeAssistantId.current) {
            return prev.map((m) =>
              m.id === activeAssistantId.current ? { ...m, text: m.text + text } : m
            );
          }
          const id = nextId();
          activeAssistantId.current = id;
          return [...prev, { id, role: 'assistant', text, streaming: true }];
        });
      }),

      addS2SListener('onAssistantDone', ({ text }) => {
        setMessages((prev) => {
          if (activeAssistantId.current) {
            return prev.map((m) =>
              m.id === activeAssistantId.current
                ? { ...m, text: text || m.text, streaming: false }
                : m
            );
          }
          if (!text) return prev;
          return [...prev, { id: nextId(), role: 'assistant', text, streaming: false }];
        });
        activeAssistantId.current = null;
      }),

      addS2SListener('onBargeIn', () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === activeAssistantId.current
              ? { ...m, streaming: false, interrupted: true }
              : m
          )
        );
        activeAssistantId.current = null;
      }),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  return { messages, reset };
}

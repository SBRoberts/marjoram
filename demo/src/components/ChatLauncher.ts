import { createWidget, html, when } from "../../../src";
import { Widget } from "../../../src/widget/createWidget";

const styles = `
  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }
  .chat { position: fixed; bottom: 1.5rem; right: 1.5rem; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; z-index: 9200; display: flex; flex-direction: column; align-items: flex-end; }
  .chat__toggle {
    width: 56px; height: 56px; border: 3px solid #111111; border-radius: 0;
    background: #111111; color: #FAFAF8; font-size: 1.5rem; cursor: pointer;
    box-shadow: 4px 4px 0 #D62626; transition: box-shadow 0.08s, transform 0.08s;
  }
  .chat__toggle:hover { box-shadow: 2px 2px 0 #D62626; transform: translate(2px, 2px); }
  .chat__badge {
    position: absolute; top: -4px; right: -4px;
    background: #D62626; color: #FAFAF8; font-size: 0.7rem; font-weight: 900;
    width: 20px; height: 20px; border: 2px solid #111111; border-radius: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .chat__panel {
    width: 300px; margin-bottom: 0.5rem;
    background: #FAFAF8; border: 3px solid #111111; box-shadow: 6px 6px 0 #111111;
    overflow: hidden; display: flex; flex-direction: column;
  }
  .chat__header {
    padding: 0.75rem 1rem; background: #111111; color: #FAFAF8; font-weight: 900;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 3px solid #111111;
  }
  .chat__close { background: none; border: none; color: #FAFAF8; font-size: 1.2rem; cursor: pointer; font-weight: 900; }
  .chat__close:hover { color: #F7C518; }
  .chat__messages { padding: 0.75rem; max-height: 240px; overflow-y: auto; overflow-anchor: auto; flex: 1; }
  .chat__msg { padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; font-size: 0.85rem; max-width: 80%; border: 2px solid #111111; }
  .chat__msg--them { background: #F0EBE0; }
  .chat__msg--us { background: #1A3FAA; color: #FAFAF8; margin-left: auto; text-align: right; }
  .chat__input-row { display: flex; border-top: 3px solid #111111; }
  .chat__input {
    flex: 1; border: none; border-right: 3px solid #111111; padding: 0.6rem 0.75rem; font-size: 0.85rem; outline: none; background: #FAFAF8;
  }
  .chat__input:focus-visible { outline: 3px solid #1A3FAA; outline-offset: -3px; }
  .chat__send {
    background: #1A3FAA; color: #FAFAF8; border: none; padding: 0 1rem; cursor: pointer;
    font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.08s;
  }
  .chat__send:hover { background: #111111; }
`;

interface Message {
  text: string;
  from: "us" | "them";
}

export const ChatLauncher = (): Widget<{
  open: boolean;
  messages: Message[];
  draft: string;
  unread: number;
}> => {
  let cleanupListeners: (() => void) | undefined;

  return createWidget({
    target: "#chat-root",
    shadow: "open",
    styles,
    model: {
      open: false as boolean,
      messages: [{ text: "Hi! How can we help?", from: "them" }] as Message[],
      draft: "",
      unread: 1 as number,
    },
    render: vm => {
      const expandedAttr = vm.$open.compute((o: boolean) => String(o));
      const toggleLabel = vm.$open.compute((o: boolean) =>
        o ? "Close chat" : "Open chat"
      );

      const badge = vm.$unread.compute((n: number) =>
        n > 0
          ? html`<span class="chat__badge" aria-hidden="true">${n}</span>`
          : html`<span></span>`
      );

      const messageList = vm.$messages.compute((msgs: Message[]) =>
        msgs.map(
          m => html`<div class="chat__msg chat__msg--${m.from}">${m.text}</div>`
        )
      );

      return html`
        <div class="chat">
          ${when(
            vm.$open,
            () => html`
              <div
                class="chat__panel"
                role="dialog"
                aria-label="Chat"
                aria-modal="true"
              >
                <div class="chat__header">
                  <span>Chat</span>
                  <button
                    class="chat__close"
                    aria-label="Close chat"
                    onclick=${() => {
                      vm.open = false;
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div
                  class="chat__messages"
                  role="log"
                  aria-label="Chat messages"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  ${messageList}
                </div>
                <div class="chat__input-row">
                  <input
                    class="chat__input"
                    aria-label="Type a message"
                    placeholder="Type a message…"
                    oninput=${(e: Event) => {
                      vm.draft = (e.target as HTMLInputElement).value;
                    }}
                    onkeydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter" && vm.draft.trim()) {
                        vm.messages = [
                          ...vm.messages,
                          { text: vm.draft.trim(), from: "us" },
                        ];
                        vm.draft = "";
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    class="chat__send"
                    aria-label="Send message"
                    onclick=${() => {
                      if (vm.draft.trim()) {
                        vm.messages = [
                          ...vm.messages,
                          { text: vm.draft.trim(), from: "us" },
                        ];
                        vm.draft = "";
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            `
          )}
          <button
            class="chat__toggle"
            aria-label="${toggleLabel}"
            aria-expanded="${expandedAttr}"
            aria-haspopup="dialog"
            onclick=${() => {
              vm.open = !vm.open;
              if (vm.open) vm.unread = 0;
            }}
          >
            💬 ${badge}
          </button>
        </div>
      `;
    },
    onMount: vm => {
      const host = document.getElementById("chat-root")!;

      const scrollToBottom = () => {
        setTimeout(() => {
          const msgs =
            host.shadowRoot?.querySelector<HTMLElement>(".chat__messages");
          if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }, 0);
      };

      // Focus the input and scroll to latest message whenever the panel opens
      vm.$open.observe((isOpen: unknown) => {
        if (isOpen) {
          setTimeout(() => {
            host.shadowRoot
              ?.querySelector<HTMLInputElement>(".chat__input")
              ?.focus();
          }, 0);
          scrollToBottom();
        }
      });

      // Scroll to bottom whenever a new message arrives
      vm.$messages.observe(() => {
        if (vm.open) scrollToBottom();
      });

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && vm.open) {
          vm.open = false;
          host.shadowRoot
            ?.querySelector<HTMLButtonElement>(".chat__toggle")
            ?.focus();
        }
      };

      const onClickOutside = (e: MouseEvent) => {
        if (vm.open && !e.composedPath().includes(host)) {
          vm.open = false;
        }
      };

      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("click", onClickOutside);
      cleanupListeners = () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("click", onClickOutside);
      };
    },
    onDestroy: () => cleanupListeners?.(),
  });
};

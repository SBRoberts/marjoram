import { createWidget, html, when } from "../../../src";
import { Widget } from "../../../src/widget/createWidget";

const styles = `
  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }
  .bell { position: fixed; bottom: 1.5rem; left: 1.5rem; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; z-index: 9200; display: flex; flex-direction: column; align-items: flex-start; }
  .bell__toggle {
    width: 56px; height: 56px; border: 3px solid #111111; border-radius: 0;
    background: #F7C518; color: #111111; font-size: 1.5rem; cursor: pointer; position: relative;
    box-shadow: 4px 4px 0 #111111; transition: box-shadow 0.08s, transform 0.08s;
  }
  .bell__toggle:hover { box-shadow: 2px 2px 0 #111111; transform: translate(2px, 2px); }
  .bell__badge {
    position: absolute; top: -4px; right: -4px;
    background: #D62626; color: #FAFAF8; font-size: 0.65rem; font-weight: 900;
    min-width: 18px; height: 18px; border: 2px solid #111111; border-radius: 0; padding: 0 3px;
    display: flex; align-items: center; justify-content: center;
  }
  .bell__dropdown {
    width: 280px; margin-bottom: 0.5rem;
    background: #FAFAF8; border: 3px solid #111111; box-shadow: 6px 6px 0 #111111;
    overflow: hidden;
  }
  .bell__header {
    padding: 0.6rem 0.75rem; border-bottom: 3px solid #111111;
    display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;
    background: #111111;
  }
  .bell__title { font-weight: 900; color: #FAFAF8; text-transform: uppercase; letter-spacing: 0.5px; }
  .bell__mark-read {
    background: none; border: none; color: #F7C518; font-size: 0.75rem;
    cursor: pointer; font-weight: 900; text-transform: uppercase; font-family: inherit;
  }
  .bell__mark-read:hover { color: #FAFAF8; }
  .bell__list { max-height: 240px; overflow-y: auto; }
  .bell__item {
    padding: 0.6rem 0.75rem; border-bottom: 2px solid #111111;
    font-size: 0.8rem; color: #111111; cursor: default;
  }
  .bell__item--unread { background: #F0EBE0; border-left: 4px solid #D62626; }
  .bell__empty { padding: 1.5rem; text-align: center; color: #666; font-size: 0.8rem; }
`;

interface Notification {
  id: number;
  text: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 1, text: "Your order has shipped!", read: false },
  { id: 2, text: "New comment on your post", read: false },
  { id: 3, text: "Welcome to Store™️", read: true },
];

export const NotificationBell = (): Widget<{
  open: boolean;
  notifications: Notification[];
  unread: (vm: any) => number;
}> => {
  let cleanupListeners: (() => void) | undefined;

  return createWidget({
    target: "#bell-root",
    shadow: "open",
    styles,
    model: {
      open: false as boolean,
      notifications: [...SAMPLE_NOTIFICATIONS] as Notification[],
      unread: (vm: any) =>
        (vm.notifications as Notification[]).filter(
          (n: Notification) => !n.read
        ).length,
    },
    render: vm => {
      const expandedAttr = vm.$open.compute((o: boolean) => String(o));
      const toggleLabel = vm.$unread.compute((n: number) =>
        n > 0 ? `Notifications, ${n} unread` : "Notifications"
      );

      const badge = vm.$unread.compute((n: number) =>
        n > 0
          ? html`<span class="bell__badge" aria-hidden="true">${n}</span>`
          : html`<span></span>`
      );

      const notificationList = vm.$notifications.compute(
        (items: Notification[]) =>
          items.length === 0
            ? [
                html`<div class="bell__empty" role="listitem">
                  No notifications
                </div>`,
              ]
            : items.map(
                n =>
                  html`<div
                    class="bell__item ${n.read ? "" : "bell__item--unread"}"
                    role="listitem"
                    aria-label="${n.read ? "" : "Unread: "}${n.text}"
                  >
                    ${n.text}
                  </div>`
              )
      );

      return html`
        <div class="bell">
          ${when(
            vm.$open,
            () => html`
              <div
                class="bell__dropdown"
                role="listbox"
                aria-label="Notifications"
              >
                <div class="bell__header">
                  <span class="bell__title" id="bell-title">Notifications</span>
                  <button
                    class="bell__mark-read"
                    aria-label="Mark all notifications as read"
                    onclick=${() => {
                      vm.notifications = (
                        vm.notifications as Notification[]
                      ).map(n => ({ ...n, read: true }));
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <div class="bell__list">${notificationList}</div>
              </div>
            `
          )}
          <button
            class="bell__toggle"
            aria-label="${toggleLabel}"
            aria-expanded="${expandedAttr}"
            aria-haspopup="listbox"
            onclick=${() => {
              vm.open = !vm.open;
            }}
          >
            🔔 ${badge}
          </button>
        </div>
      `;
    },
    onMount: vm => {
      const host = document.getElementById("bell-root")!;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && vm.open) {
          vm.open = false;
          host.shadowRoot
            ?.querySelector<HTMLButtonElement>(".bell__toggle")
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

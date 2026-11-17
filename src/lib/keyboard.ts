/**
 * iOS öffnet die Tastatur nur, wenn ein Eingabefeld direkt in einer Benutzeraktion fokussiert wird.
 * Wir fokussieren daher synchron ein verstecktes Feld und geben den Fokus später an das echte Textfeld weiter.
 */
let proxy: HTMLInputElement | null = null;

export function primeKeyboard() {
  if (typeof document === 'undefined') return;
  if (!proxy) {
    proxy = document.createElement('input');
    proxy.type = 'text';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.tabIndex = -1;
    proxy.style.cssText = 'position:fixed;top:30%;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;pointer-events:none;';
    document.body.appendChild(proxy);
  }
  proxy.focus({ preventScroll: true });
}

export function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  return t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';
}

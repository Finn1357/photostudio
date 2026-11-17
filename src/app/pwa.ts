/** Service-Worker-Registrierung (Offline-Nutzung, automatische Updates). */
import { registerSW } from 'virtual:pwa-register';
import { toast } from '../ui/toast';

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  registerSW({
    immediate: true,
    onOfflineReady() {
      toast('PhotoStudio ist jetzt offline verfügbar', 'success', 2500);
    },
    onNeedRefresh() {
      toast('Eine neue Version wird beim nächsten Start geladen', 'info', 3500);
    },
  });
}

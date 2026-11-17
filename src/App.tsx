/** App-Hülle: Routing, Design-Modus, Hinweise, Hintergrundaufgaben. */
import { useEffect } from 'react';
import { useRoute } from './app/router';
import { HomeScreen } from './screens/Home';
import { TemplatesScreen } from './screens/Templates';
import { ProjectsScreen } from './screens/Projects';
import { EditorScreen } from './screens/Editor';
import { ToastHost, applyTheme, readThemePref } from './ui/sheets';
import { startAutosave } from './editor/persistence';
import { collectGarbage, requestPersistentStorage } from './lib/db';

export default function App() {
  const route = useRoute();

  useEffect(() => {
    applyTheme(readThemePref());
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(readThemePref());
    mq?.addEventListener?.('change', onChange);
    startAutosave();
    void requestPersistentStorage();
    // Nicht mehr verwendete Bilder später aufräumen (nicht beim Start blockieren)
    const t = setTimeout(() => void collectGarbage().catch(() => undefined), 8000);
    // iOS: Pinch-Zoom der gesamten Seite verhindern
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', prevent);
    return () => {
      mq?.removeEventListener?.('change', onChange);
      document.removeEventListener('gesturestart', prevent);
      clearTimeout(t);
    };
  }, []);

  let screen: React.ReactNode;
  switch (route.name) {
    case 'editor':
      screen = <EditorScreen key={route.id} id={route.id} />;
      break;
    case 'templates':
      screen = <TemplatesScreen key={`${route.category}-${route.cards}-${route.query}`} category={route.category} cards={route.cards} query={route.query} />;
      break;
    case 'projects':
      screen = <ProjectsScreen />;
      break;
    default:
      screen = <HomeScreen />;
  }

  return (
    <>
      {screen}
      <ToastHost />
    </>
  );
}

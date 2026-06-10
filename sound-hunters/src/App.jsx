import { AppProvider, useApp } from './state/AppContext.jsx';
import { Facilitator } from './screens/Facilitator.jsx';
import { PlayerHome } from './screens/PlayerHome.jsx';
import { Phase1Naming } from './screens/Phase1Naming.jsx';
import { Phase2Baskets } from './screens/Phase2Baskets.jsx';
import { Phase3TwinCheck } from './screens/Phase3TwinCheck.jsx';
import { VoicesCheck } from './screens/VoicesCheck.jsx';
import { FreeArea } from './screens/FreeArea.jsx';

function Router() {
  const { ready, route, speaker, session } = useApp();
  if (!ready) return <div className="boot">⏳</div>;

  // Player routes need an active session (facilitator starts it — rule 4).
  const needsSession = ['home', 'phase1', 'phase2', 'phase3', 'free'].includes(route);
  if (needsSession && (!speaker || !session)) return <Facilitator />;

  switch (route) {
    case 'home': return <PlayerHome />;
    case 'phase1': return <Phase1Naming />;
    case 'phase2': return <Phase2Baskets />;
    case 'phase3': return <Phase3TwinCheck />;
    case 'voices': return <VoicesCheck />;
    case 'free': return <FreeArea />;
    default: return <Facilitator />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import { createRoot } from 'react-dom/client';

import App from './pages/App';

export default createBridgeComponent({
  rootComponent: App,
  render: (CurrentApp, container) => {
    const root = createRoot(container as HTMLElement, { identifierPrefix: 'pvm-armc-' });
    root.render(CurrentApp);
    return root;
  },
  defaultRootOptions: {
    identifierPrefix: 'remote-app-',
    onRecoverableError: (error) => {
      console.error('Remote armc app error:', error);
    },
  },
});

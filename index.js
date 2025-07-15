import structuredClone from 'structured-clone';
import { Buffer } from 'buffer';

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = structuredClone;
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { registerRootComponent } from 'expo';

import App from './App';




// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
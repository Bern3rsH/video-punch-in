import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['activeTab', 'scripting', 'clipboardWrite', 'contextMenus'],
    commands: {
      'copy-video-timestamp': {
        suggested_key: {
          default: 'Alt+Shift+C',
          mac: 'MacCtrl+Shift+C',
        },
        description: 'Copy video timestamp URL',
      },
    },
  },
});

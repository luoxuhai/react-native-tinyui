const path = require('path');
const pkg = require('../package.json');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    'react-native-safe-area-context': {
      root: path.dirname(
        require.resolve('react-native-safe-area-context/package.json')
      ),
    },
    'react-native-screens': {
      root: path.dirname(require.resolve('react-native-screens/package.json')),
    },
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
      },
    },
  },
};

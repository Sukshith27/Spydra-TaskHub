module.exports = {
  preset: 'react-native',
   setupFiles: ['./jest.setup.js'], 
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-redux|@reduxjs/toolkit|immer|react-clone-referenced-element)/)',
  ],
};
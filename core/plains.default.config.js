/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  devMode: true,
  plugins: {
    DevServer: {
      port: 8080,
    }
  },
  workers: {},
}

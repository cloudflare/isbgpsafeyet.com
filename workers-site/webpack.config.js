module.exports = {
  target: "webworker",
  entry: "./index.js",
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.csv$/i,
        use: 'raw-loader',
      },
    ],
  },
}

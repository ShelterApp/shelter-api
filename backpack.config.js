require('dotenv').config();

module.exports = {
  webpack: (config, options, webpack) => {
    if (options.env !== 'development') {
      config.devtool = undefined;

      config.plugins = config.plugins.reduce(
        (plugins, plugin) => plugin.banner ? plugins : plugins.concat(plugin),
        [],
      );
    }

    config.entry = {
      index: ['./src/index.ts'],
    };

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
    };

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
    });

    return config;
  }
};

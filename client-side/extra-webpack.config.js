const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;
const { merge } = require('webpack-merge');

module.exports = (angularWebpackConfig, options) => {
    const moduleFederationfWebpackConfig = {
        output: {
          uniqueName: "managerEditor"
        },
        optimization: {
          runtimeChunk: false,
        },
        plugins: [
          new ModuleFederationPlugin({
            remotes: {},
            name: "manager_editor",
            filename: "manager_editor.js",
            exposes: {
            },
            shared: {
              "@angular/core": { eager: true, singleton: true,  strictVersion: false },
              "@angular/common": { eager: true,singleton: true,strictVersion: false },
              "@angular/common/http": { eager: true, singleton: true, strictVersion: false },
              "rxjs": { eager: true,singleton: true,strictVersion: false },
              "@ngx-translate/core": { eager: true, singleton: true, strictVersion: false },
              "@angular/router": { eager: true, singleton: true,  strictVersion: false }

          }
          })
        ],
      };
    const mergedWebpackConfig = merge(angularWebpackConfig, moduleFederationfWebpackConfig);
    const singleSpaWebpackConfig = singleSpaAngularWebpack(mergedWebpackConfig, options);
    return singleSpaWebpackConfig;
};


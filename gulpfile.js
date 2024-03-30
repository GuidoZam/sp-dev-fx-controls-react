"use strict";

const gulp = require("gulp");
const build = require("@microsoft/sp-build-web");
const fs = require("fs");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

// Update the version number in the version.ts file
gulp.task("versionUpdater", (done) => {
  const pkgContents = require("./package.json");
  const filePath = "./src/common/telemetry/version.ts";
  const fileContents = `export const version: string = "{versionPlaceholder}";`;
  const newContents = fileContents.replace(
    "{versionPlaceholder}",
    pkgContents.version
  );
  console.log(`Updating version number to: ${pkgContents.version}`);
  fs.writeFileSync(filePath, newContents, { encoding: "utf8" });
  done();
});

if (process.argv.indexOf("--size") !== -1) {
  build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
      generatedConfiguration.plugins.push(new BundleAnalyzerPlugin());

      generatedConfiguration.module.rules.push({
        test: /\.[cm]?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      });

      // generatedConfiguration.module.rules.push({
      //   test: /\.[cm]?js$/,
      //   exclude:
      //     /node_modules\/(?!(contentful\/dist|@contentful\/live-preview)\/).*/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       presets: [
      //         [
      //           "@babel/preset-env",
      //           {
      //             targets: {
      //               browsers: ["last 2 versions", "ie >= 11"],
      //             },
      //           },
      //         ],
      //       ],
      //       plugins: ["@babel/plugin-proposal-class-properties"],
      //     },
      //   },
      // });

      return generatedConfiguration;
    },
  });
}

// Added to support chart.js version 4 compatibility
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    generatedConfiguration.module.rules.push({
      test: /\.[cm]?js$/,
      exclude:
        /node_modules\/(?!(contentful\/dist|@contentful\/live-preview)\/).*/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  browsers: ["last 2 versions", "ie >= 11"],
                },
              },
            ],
          ],
          plugins: ["@babel/plugin-proposal-class-properties"],
        },
      },
    });

    return generatedConfiguration;
  },
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set("serve", result.get("serve-deprecated"));

  return result;
};

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require("gulp"));

const karmaTask = build.karma;
if (karmaTask) {
  karmaTask.taskConfig.configPath = "./config/karma.config.js";
}

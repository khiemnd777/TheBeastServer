var path = require("path");
var TSLIB = "tslib";
var typescript = require("typescript");
var fs = require("fs");
var _ = require("lodash");

function resolveId() {
  let configFileName = typescript.findConfigFile(
    process.cwd(),
    typescript.sys.fileExists
  );
  var text = typescript.sys.readFile(configFileName);
  if (text === undefined) throw new Error("Can not load tsconfig.json");
  var result = typescript.parseConfigFileTextToJson(configFileName, text);
  var baseDir = path.dirname(configFileName);
  let parsedConfig = typescript.parseJsonConfigFileContent(
    result.config,
    typescript.sys,
    baseDir
  );
  return {
    load: function(id) {
      if (_.endsWith(id, "tslib.es6.js") || _.endsWith(id, "tslib.js")) {
        var content = fs.readFileSync(id, "utf8");
        return { code: content };
      }
      // return null;
    },
    resolveId: function(importee, importer) {
      if (importee === TSLIB) return "\0" + TSLIB;

      if (!importer) return null;

      importer = importer.split("\\").join("/");

      // TODO: use module resolution cache
      const result = typescript.nodeModuleNameResolver(
        importee,
        importer,
        parsedConfig.options,
        typescript.sys
      );

      if (result.resolvedModule && result.resolvedModule.resolvedFileName) {
        var str = result.resolvedModule.resolvedFileName;
        if (_.endsWith(str, ".d.ts")) return null;
        if (_.endsWith(str, ".ts")) {
          return str.substring(0, str.lastIndexOf(".ts")) + ".js";
        }
      }

      return null;
    }
  };
}
module.exports = resolveId;

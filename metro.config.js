const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

// node_modules 절대 경로 하드코딩을 피하기 위해 zustand 설치 경로를 1회 계산한다.
const zustandDir = path.dirname(require.resolve("zustand/package.json"));

/**
 * Metro 커스텀 resolver.
 * - web 빌드에서만 `zustand` import를 CJS `.js` 엔트리로 강제한다.
 * - 목적: 웹 번들에서 ESM `import.meta` 경로가 선택되는 것을 차단한다.
 * - 그 외 모듈/플랫폼은 Metro 기본 resolver에 그대로 위임한다.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && /^zustand(\/|$)/.test(moduleName)) {
    // 확장자를 명시한 import는 호출 의도를 존중해 그대로 처리한다.
    if (moduleName.includes(".")) {
      return context.resolveRequest(context, moduleName, platform);
    }

    // `zustand` / `zustand/*` 요청을 대응되는 CJS 파일 경로로 변환한다.
    const subpath = moduleName.replace(/^zustand\/?/, "");
    const cjsFile = path.join(
      zustandDir,
      subpath ? `${subpath}.js` : "index.js",
    );

    // CJS 파일이 실제로 있으면 해당 파일을 사용하고, 없으면 기본 해석으로 폴백한다.
    if (fs.existsSync(cjsFile)) {
      return { type: "sourceFile", filePath: cjsFile };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });

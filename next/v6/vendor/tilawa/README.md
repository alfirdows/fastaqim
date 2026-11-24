# Tilawa engine (third-party, unmodified)

`tilawa.mjs` is `@tilawa/core` 1.0.0-rc.1 (MIT, github.com/yazinsai/tilawa) bundled with `onnxruntime-web` 1.30.0 (MIT, Microsoft)
by esbuild (`--bundle --format=esm --minify --target=safari16`), with no code changes. Entry:

```js
export { createTilawa, prepareMicrophone } from "@tilawa/core/web";
export { MODEL_REGISTRY, SDK_VERSION, MicrophoneError } from "@tilawa/core";
```

The model weights (CC BY 4.0), the Qur'an reference data and the onnxruntime .wasm files are NOT stored here. The engine
downloads them once from tilawa.dev/v1/ into the reader's own browser and keeps them there. See THIRD-PARTY-LICENSES.md at the repo root.

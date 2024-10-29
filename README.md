# Santo SDK Sniffer

![](images/readme-screenshot.png)

## QA
Visit each of these microsites, and run the sniffer to validate that it detects older SDKs. It won't catch everything but is a good first step to validate any new changes to the Santo Sniffer.

- https://sentryv8.vercel.app/
- https://sentryv7.vercel.app/
- https://sentryv6.vercel.app/
- https://sentryv5.vercel.app/

## To run locally:
```
npx webpack # it will update dist
```

'Load unpacked' from chrome://extensions -> `./dist`

## Troubleshooting

If you see an error like the below code block, run `export NODE_OPTIONS=--openssl-legacy-provider` before you run `npx webpack`.

```
/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:133
                if(isError) throw e;
                            ^

Error: error:0308010C:digital envelope routines::unsupported
    at Hash (node:internal/crypto/hash:79:19)
    at Object.createHash (node:crypto:139:10)
    at module.exports (/Users/cstavitsky/detective-scentry/node_modules/webpack/lib/util/createHash.js:135:53)
    at NormalModule._initBuildHash (/Users/cstavitsky/detective-scentry/node_modules/webpack/lib/NormalModule.js:417:16)
    at handleParseError (/Users/cstavitsky/detective-scentry/node_modules/webpack/lib/NormalModule.js:471:10)
    at /Users/cstavitsky/detective-scentry/node_modules/webpack/lib/NormalModule.js:503:5
    at /Users/cstavitsky/detective-scentry/node_modules/webpack/lib/NormalModule.js:358:12
    at /Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:373:3
    at iterateNormalLoaders (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:214:10)
    at iterateNormalLoaders (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:221:10)
    at /Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:236:3
    at context.callback (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:111:13)
    at makeSourceMapAndFinish (/Users/cstavitsky/detective-scentry/node_modules/ts-loader/dist/index.js:88:5)
    at successLoader (/Users/cstavitsky/detective-scentry/node_modules/ts-loader/dist/index.js:68:9)
    at Object.loader (/Users/cstavitsky/detective-scentry/node_modules/ts-loader/dist/index.js:22:12)
    at LOADER_EXECUTION (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:119:14)
    at runSyncOrAsync (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:120:4)
    at iterateNormalLoaders (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:232:2)
    at Array.<anonymous> (/Users/cstavitsky/detective-scentry/node_modules/loader-runner/lib/LoaderRunner.js:205:4)
    at Storage.finished (/Users/cstavitsky/detective-scentry/node_modules/enhanced-resolve/lib/CachedInputFileSystem.js:55:16)
    at /Users/cstavitsky/detective-scentry/node_modules/enhanced-resolve/lib/CachedInputFileSystem.js:91:9
    at /Users/cstavitsky/detective-scentry/node_modules/graceful-fs/graceful-fs.js:123:16
    at FSReqCallback.readFileAfterClose [as oncomplete] (node:internal/fs/read/context:68:3) {
  opensslErrorStack: [
    'error:03000086:digital envelope routines::initialization error',
    'error:0308010C:digital envelope routines::unsupported'
  ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}

```

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

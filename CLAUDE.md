# homebridge-garage-cli-cmd-trigger

Homebridge plugin that creates a HomeKit Garage Door accessory with optional CLI command triggers on open/close.

## Stack
- Node.js plugin, no build step, entry point is index.js
- node-persist v4 for async state persistence (stores open/closed state across restarts)
- Homebridge HAP-NodeJS API for HomeKit integration

## Key architecture decisions
- Storage is initialised async in the constructor via this.storageReady promise
- onSet awaits this.storageReady before any storage operations
- Door defaults to CLOSED until cached state loads from disk
- forgiveParseErrors: true handles missing or corrupt storage files gracefully
- openCmd and closeCmd are optional shell commands executed via child_process.exec on state change

## Compatibility
- Homebridge v1.6.0 and v2.0.0+
- Node.js 18, 20, 22, 24
- Uses onGet / onSet (not the deprecated on('get') / on('set') callbacks)

## Publishing
- Beta releases: npm publish --tag beta (version format: x.x.x-beta.x)
- Stable releases: npm publish
- Plugin is listed on npm as homebridge-garage-cli-cmd-trigger

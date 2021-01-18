# apinator
Easily create and maintain modular APIs for Node.js, based on express

## `config`
Config is created under the `package.json` file. Simply add `apinator` with it's options:
```json
"name": "Project name",
"apinator": {
    "overwrite": true
}
```
* `overwrite`: Boolean. Overwrites files (in case they exist) when generating new ones.

## Templates
When creating new templates, use this as your code base
```js
exports.generate = function () {
    return `
// Your code in here    
`.trim()
}
```

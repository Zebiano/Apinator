exports.generate = function () {
    return `
{
    "main": "src/main.js",
    "scripts": {
        "dev": "nodemon"
    }
}
`.trim()
}

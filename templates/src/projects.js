exports.generate = function (projectName) {
    return `
[
    "./${projectName}/server"
]
`.trim()
}

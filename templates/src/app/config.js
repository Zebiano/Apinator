exports.generate = function (projectName) {
    return `
{
    "name": "${projectName}",
    "database": {
        "name": "${projectName}"
    },
    "routes": []
}
`.trim()
}

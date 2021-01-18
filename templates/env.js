exports.generate = function (env, port, db_host) {
    return `
ENV=${env}
APP_PORT=${port}
DB_HOST=${db_host}
`.trim()
}

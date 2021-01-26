exports.generate = function (module) {
    return `
// Require: Files
const ${module.uppercase} = require('./model')

// Get
exports.get = function (filters) {
    return ${module.uppercase}
        .find(filters)
        .exec()
        .then(function (${module.pluralLowercase}) {
            if (${module.pluralLowercase}.length == 0) return { data: ${module.pluralLowercase}, code: 404 }
            else return { data: ${module.pluralLowercase}, code: 200 }
        })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}

// Get One
exports.getOne = function (filters) {
    return ${module.uppercase}
        .findOne(filters)
        .exec()
        .then(function (${module.lowercase}) {
            if (${module.lowercase} == null) return { data: ${module.lowercase}, code: 404 }
            else return { data: ${module.lowercase}, code: 200 }
        })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}

// Get by ID
exports.getById = function (id) {
    return ${module.uppercase}
        .findById(id)
        .exec()
        .then(function (${module.lowercase}) {
            if (${module.lowercase} == null) return { data: ${module.lowercase}, code: 404 }
            else return { data: ${module.lowercase}, code: 200 }
        })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}

// Post
exports.post = function (body) {
    return new ${module.uppercase}(body)
        .save()
        .then(function (${module.lowercase}) { return { data: ${module.lowercase}, code: 201 } })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}

// Put
exports.put = function (id, body) {
    return ${module.uppercase}
        .findByIdAndUpdate(id, body, { new: true })
        .exec()
        .then(function (${module.lowercase}) {
            if (${module.lowercase} == null) return { data: ${module.lowercase}, code: 404 }
            else return { data: ${module.lowercase}, code: 201 }
        })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}

// Delete
exports.delete = function (id) {
    return ${module.uppercase}
        .findByIdAndDelete(id)
        .exec()
        .then(function (${module.lowercase}) {
            if (${module.lowercase} == null) return { data: ${module.lowercase}, code: 404 }
            else return { data: ${module.lowercase}, code: 200 }
        })
        .catch(function (err) {
            console.log(err)
            return { err: err, code: 500 }
        })
}
`.trim()
}

exports.generate = function () {
    return `
// Require: Packages
const router = require('express').Router()

// Require: Files
const controller = require('./controller')

// Routes
router.route('/')
    .get(async function (req, res) {
        const ans = await controller.get(req.query)
        if ('err' in ans) res.status(ans.code).send(ans.err)
        else res.status(ans.code).send(ans.data)
    })
    .post(async function (req, res) {
        const ans = await controller.post(req.body)
        if ('err' in ans) res.status(ans.code).send(ans.err)
        else res.status(ans.code).send(ans.data)
    })

router.route('/:id')
    .get(async function (req, res) {
        const ans = await controller.getById(req.params.id)
        if ('err' in ans) res.status(ans.code).send(ans.err)
        else res.status(ans.code).send(ans.data)
    })
    .put(async function (req, res) {
        const ans = await controller.put(req.params.id, req.body)
        if ('err' in ans) res.status(ans.code).send(ans.err)
        else res.status(ans.code).send(ans.data)
    })
    .delete(async function (req, res) {
        const ans = await controller.delete(req.params.id)
        if ('err' in ans) res.status(ans.code).send(ans.err)
        else res.status(ans.code).send(ans.data)
    })

// Exports
module.exports = router    
`.trim()
}

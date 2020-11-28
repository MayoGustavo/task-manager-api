const express = require('express')
const Task = require('../models/task')
const auth = require('../middlewares/auth')

const router = express.Router()


router.post('/tasks', auth, async (req, res) => {

    try {
        req.body.owner = req.user._id
        const task = new Task(req.body)
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sort) {
        const sortCriteria = req.query.sort.split(":")
        sort[sortCriteria[0]] = sortCriteria[1]
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    try {
        const _id = req.params.id
        task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task)
        {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updateKeys = Object.keys(req.body)
    const validKeys = ['description', 'completed']
    const isUpdateValid = updateKeys.every((key) => { return validKeys.includes(key) })

    if (!isUpdateValid) {
        return res.status(400).send({error: 'The update contains invalid properties.'})
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        
        if (!task) {
            return res.status(404).send()
        }

        updateKeys.forEach((key) => { task[key] = req.body[key] })
        await task.save()

        res.send(task)

    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)

    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
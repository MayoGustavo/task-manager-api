const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const email = require('../emails/account')

const router = express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {

        if (!file.originalname.match(/^.*\.(jpg|JPG|png|PNG)$/)) {
            return cb(new Error('Invalid image file extension.'))
        }
        cb(undefined, true)
    }
})


router.post('/users', async (req, res) => {

    try {
        const user = new User(req.body)
        const token = await user.createAuthToken()
        email.sendWelcomeEmail(user)
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.createAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth,  async (req, res) => {

    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {

    const updateKeys = Object.keys(req.body)
    const validKeys = ['name', 'email' , 'password' , 'age']
    const isUpdateValid = updateKeys.every((key) => { return validKeys.includes(key) })

    if (!isUpdateValid) {
        return res.status(400).send({error: 'The update contains invalid properties.'})
    }

    try {
        updateKeys.forEach((key) => { req.user[key] = req.body[key] })
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        email.sendFarewellEmail(req.user)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    try {

        const buffer = await sharp(req.file.buffer)
            .resize(200, 200, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('png')
            .toBuffer()

        req.user.avatar = buffer
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({error:error.message})
    }
}, (error, req, res, next) => {
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {

    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error ()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router
const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({ 
    name: {
        type: String, 
        required: [true, 'You must provide your name.'],
        trim: true
    }, 
    email: {
        type: String,
        required: [true, 'You must provide your email.'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value)
            },
            message: props => props.value + ' is not a valid email!'
        }
    },
    password: {
        type: String,
        required: [true, 'A password is required.'],
        minlength: [8, 'The password lenght must be greter than 8 characters.'],
        trim: true,
        validate: {
            validator: (value) => {
                return !value.toLowerCase().includes('password')
            },
            message: 'Your password can not contain the word "password"'
        }
    },
    age: {
        type: Number,
        default: 1,
        min: [1, 'The age must be a positive value.'],
        max: [100, 'Is the age correct?']
    },
    avatar: {
        type: Buffer
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},
{
    timestamps: true
});


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

userSchema.methods.createAuthToken = async function () {

    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    //Save Auth token in the DB
    user.tokens.push({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user)
    {
        throw new Error('Unable to login')
    }

    const doesPasswordMatch = await bcrypt.compare(password, user.password)

    if (!doesPasswordMatch)
    {
        throw new Error('Unable to login')
    }

    return user
}

//Hash password before saving user
userSchema.pre('save', async function() {
   
    const user = this

    if (user.isModified('password') )
    {
        const pwd = await bcrypt.hash(user.password, 8)
        user.password = pwd
    }
} )

userSchema.pre('remove', async function () {
    const user = this
    await Task.deleteMany({owner:user._id})
})


const User = mongoose.model('User', userSchema)


module.exports = User
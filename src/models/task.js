const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({ 
    description: {
        type: String,
        required: [true, 'You must provide a task description.'],
        trim: true
    }, 
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
{
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema)


module.exports = Task
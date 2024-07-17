import {Schema, model } from 'mongoose';

const contactSchema = new Schema({
    name: {
        type : 'String',
        required: [true, 'Name is required'],
        minLength : [5, 'Name must be at least 5 characters'],
        maxLength : [50, 'Name should be less then 50 characters'],
        trim : true,
    },
    email: {
        type : "String",
        required: [true, 'Email is required'],
        lowercase : true,
        trim : true,
        match : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email address'
        ]
    },
    message: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const Contact = model('Contact', contactSchema);

export default Contact;

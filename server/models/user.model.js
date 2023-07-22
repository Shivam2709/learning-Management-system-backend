import { Schema, model } from "mongoose";

const userSchema = new Schema ({
    fullName: {
        type : 'String',
        required: [true, 'Name is required'],
        minLength : [5, 'Name must be at least 5 characters'],
        maxLength : [50, 'Name should be less then 50 characters'],
        trim : true,
        lowercase : true
    },
    email: {
        type : "String",
        required: [true, 'Email is required'],
        lowercase : true,
        trim : true,
        unique : true,
        match : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type : 'String',
        required : [true, 'Password is required'],
        minLength : [8, 'Password must be at least 8 characters'],
        select : false
    },
    avatar : {
        public_id: {
            type : 'String',
        },
        secure_url: {
            type : 'String'
        }
    },
    role : {
        type : 'String',
        enum : ['USER', 'ADMIN'],
        default : 'USER'
    },
    forgetPasswordToken : String,
    forgetPasswordExpiry : Date
}, {
    timestamps : true
});

const User = model("User", userSchema);

export default User;
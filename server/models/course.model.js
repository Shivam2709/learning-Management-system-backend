import { model, Schema } from "mongoose";

const courseSchema = new Schema ({
     title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [60, 'Title should be less than 60 characters'],
        trim: true,
     },
     description: {
        type: String,
        required: [true, 'description is required'],
        minLength: [5, 'description must be at least 5 characters'],
        maxLength: [200, 'description should be less than 200 characters'],
     },
     category: {
        type: String,
        required: true,
     },
     thumbnail: {
        public_id: {
            type: String,
            required: true,
        },
        secure_url: {
            type: String,
            required: true,
        }
     },
     lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true,
                },
                secure_url: {
                    type: String,
                    required: true,
                }
            }
        }
     ],
     NumberOfLectures: {
        type: Number,
        default: 0,
     },
     createdBy: {
        type: String,
        required: true,
     }, 
},{
    timestamps: true
});

const Course = model('Course', courseSchema);

export default Course;
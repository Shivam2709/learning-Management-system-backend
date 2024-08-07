import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';

const getAllCourses = async (req, res) => {
    const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
        success: true,
        message: 'All courses',
        courses
    });

}

const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if(!course) {
            return next(new AppError('Invalid Course id', 400))
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        })
    } catch(e) {
        return next(new AppError(e.message, 500));
    }

}

const createCourse = async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if(!title || !description || !category || !createdBy) {
        return next(new AppError('All fields are required', 400))
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: Course._id,
            secure_url:"https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxy.jpg",
    },
    });
     
    if(!course) {
        return next(new AppError('Course could not be created, please try again', 500));
    }
    
    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });

            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
    
            fs.rm(`upload/${req.file.filename}`);

        }catch(e) {
            return next(new AppError(e.message, 500))
        }
        
    }
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Course created successfully',
        course,
    })
}

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body // body se jo bhi mile raha h usko update kr do..
            },
            {
                runValidators: true // ye check krega jo new data aa rha h o mongo me jo structure define h uske hisab se h ke nhi.
            }
        );

        if(!course) {
            return next(new AppError('Course id does not exist', 500));
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        })

    } catch(e) {
        return next(new AppError(e.message, 500))
    }
}

const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course) {
            return next(new AppError('Course id does not exist', 500));
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })

    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const addLectureToCourseById = async (req, res, next) => {
    const { title, description } = req.body;
    const { id } = req.params;

    if(!title || !description ) {
        return next(new AppError('All fields are required', 400))
    }

    const course = await Course.findById(id);

    if (!course) {
        return next(new AppError('Course id does not exist', 500));
    }

    const lectureData = {
        title,
        description,
        lecture: {}
    };

    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                chunk_size: 50000000, // 50 mb size
                resource_type: "video",
            });
            if (result) {
                course.thumbnail = course.thumbnail || {};
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }
    
            fs.rm(`uploads/${req.file.filename}`);

        }catch(e) {
            return next(new AppError(e.message, 500))
        }
    }

    Course.lectures.push(lectureData);

    Course.NumberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lectures successfully added to the course',
        course
    })
}

const removeLectureFromCourse = async (req, res, next) => {
    const { courseId, lectureId } = req.query;

    console.log(courseId);

    if(!courseId) {
        return next(new AppError('Course id is required', 400));
    }

    if(!lectureId) {
        return next(new AppError('Lecture id is required', 400));
    }

    const course = await Course.findById(courseId);

    if(!course) {
        return next(new AppError('Invalid ID or Course does not exist.', 400));
    }
}

export { 
    getAllCourses, 
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    removeLectureFromCourse
}
import { Router } from "express";
import { createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse, addLectureToCourseById, removeLectureFromCourse } from "../controllers/course.controller.js";
import { isLoggedIn, authorizedRoles, authorizeSubscriber } from "../middlewares/auth.middleware.js";
import upload from '../middlewares/multer.middleware.js'

const router = new Router();

router.route('/')
        .get(getAllCourses)
        .post(
             isLoggedIn,
             authorizedRoles('ADMIN'),
            upload.single('thumbnail'),
            createCourse
        )
        .delete(
            isLoggedIn,
            authorizedRoles('ADMIN'),
            removeCourse,
        )

router.route('/:id')
        .get(isLoggedIn, authorizeSubscriber, getLecturesByCourseId)
        .put(
            isLoggedIn,
            authorizedRoles('ADMIN'),
            updateCourse
        )
        .post(
            isLoggedIn,
            authorizedRoles('ADMIN'),
            upload.single('lecture'),
            addLectureToCourseById
        );

router.route('/lecture')
        .delete(
            isLoggedIn,
            authorizedRoles('ADMIN'),
            removeLectureFromCourse // Delete a specific lecture from a course
        );


export default router;
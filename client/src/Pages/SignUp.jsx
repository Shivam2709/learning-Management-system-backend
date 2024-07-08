import { useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../Layouts/HomeLayout";

const SignUp = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [previewImage, setPreviewImage] = useState("");

    const [signupData, setSignupData ] = useState({
        fullName: "",
        email: "",
        password: "",
        avatar: ""
    })

    function handleUserInput(e) {
        const { name, value } = e.target;
        setSignupData({
            ...signupData,
            [name]: value
        })
    }

  return (
    <HomeLayout>
      <div className="flex items-center justify-center h-[90vh] ">
        <form className="flex flex-col justify-center gap-3 rounded-lg p-4 text-white w-96 shadow-[0_0_10px_black]">
          <h1 className="text-center text-2xl font-bold">Registration Form</h1>

          <label htmlFor="image_uploads" className="cursor-pointer">
            {previewImage ? (
              <img
                className="w-24 h-24 rounded-full m-auto"
                src={previewImage}
              />
            ) : (
              <BsPersonCircle className="w-24 h-24 rounded-full m-auto" />
            )}
          </label>
          <input
            className="hidden"
            type="file"
            name="image_uploads"
            id="image_uploads"
            accept=".jpg, .jpeg, .png, .svg"
          />

            <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold">Full Name </label>
            <input
              type="fullName"
              id="fullName"
              name="fullName"
              required
              placeholder="Enter your Full Name..."
              className="bg-transparent px-2 py-1 border rounded-sm"
              onChange={handleUserInput}
              value={signupData.fullName}
            />
            </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email..."
              className="bg-transparent px-2 py-1 border rounded-sm"
              onChange={handleUserInput}
              value={signupData.email}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-semibold">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password..."
              className="bg-transparent px-2 py-1 border rounded-sm"
              onChange={handleUserInput}
              value={signupData.password}
            />
          </div>
          <button type="submit" className="mt-2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-out duration-300 rounded-sm py-2 font-semibold text-lg cursor-pointer">
            Create account
          </button>

          <p className="text-center">
            Already have an account ? <Link to="/login" className="link text-accent cursor-pointer">Login</Link>
          </p>
        </form>
      </div>
    </HomeLayout>
  );
};

export default SignUp;

import { response } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req , res) => {
    // get user details
    // validation - check if feilds are not empty
    // check if avatar is there or not
    // then use of multer to upload file to local system
    // then use cloudinary to upload file , save the url 
    // create an object
    // save all data
    // remove the password and refresh token from object
    // return the object


    const {username , email , fullName  , password } = req.body;

    if([fullName , email , password , username].some((feild) => feild.trim() === "")){
        throw new ApiError(400 , "All Feilds are Required")
    }

    const existedUser = await User.findOne({
        $or : [{ email } , { username }]
    })

    if(existedUser){
        throw new ApiError(409 , "User with Email or Username Already Exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(409 , "Avatar File is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400 , "Avatar File is required");
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email ,
        password,
        username : username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new Error(500 , "Something went Wrong while Registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registered Successfullyf")
    )



})


export {registerUser}
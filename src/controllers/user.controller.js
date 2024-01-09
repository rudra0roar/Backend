import { response } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken , refreshToken }
        
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating Access and Refresh Token")
    }
}






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

const loginUser = asyncHandler( async (req , res) => {
    // username and Password from req.body
    // check if the email exists  (or) check if the username exists
    // if exists compare the passwords
    // then give the acccess token 
    // access and refresh token dene user ko
    // send cookies


    const {username , email , password} = req.body;

    if(!(username || email)){
        throw new ApiError(400 , "username or email is required")
    }

    if(!password){
        throw new ApiError(400 , "Password is Required")
    }

    const user = await User.findOne({
        $or : [ { username } , { email } ]
    })

    if(!user){
        throw new ApiError(404 , "User does not Exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid User Credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , 
            {
                user : loggedInUser ,
                accessToken ,
                refreshToken
            },
            "User LoggedIn Successfully"
            )
    )

})


const logoutUser = asyncHandler( async(req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).clearCookie("accessToken" , options).clearCookie("refreshToken" , options).json(
        new ApiResponse(200 , {} , "User LoggedOut Successfully")
    )


})

const refreshAccessToken = asyncHandler( async (req , res) => {
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401 ,"unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
        console.log(decodedToken);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(400 , "Invalid Refresh Token")
        }
    
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(400 , "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(200 , 
                {accessToken , refreshToken : newRefreshToken},
                "Access Token Refreshed"
                )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Refresh Token")
    }


})


export {registerUser , loginUser , logoutUser , refreshAccessToken}
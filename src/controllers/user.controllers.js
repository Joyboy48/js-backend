import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(500,`Something want wrong while 
            generating refresh and access tokens`)
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    //get user detail from frontend name email paword etc.
    //validation isempty? correct format? 
    //check if user already exist: username and email
    //check for images and avatar
    //upload them to cloudinary: avatar/
    //create user object - create entry in db
    //jab koi entry kerte hai mongodb toh sara response wapis ajata hai
    //get response and remove password and refresh token from it
    //check for user creation
    //return response


    const {fullName,email,username,password} = req.body
    console.log(email);

    // if(fullName === ""){
    //     throw new apiError(400,"fullName is required")
    // }


    //check if all fields are filled
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new apiError(400,"All feilds are required")
    }


    //check if user already exist
    const existedUser =  await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new apiError(409,"User with email or username already exist ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;


    //check for coverimage  
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    //check for avatar
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    //uppload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //check
    if(!avatar){
        throw new apiError(400,"Avatar file is required")
    }

    const user =  await User.create({
        fullName,
        avatar: avatar.url,
        email,
        coverImage:coverImage?.url || "",
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"Something went wrong while registering user")
    }


    return res.status(201).json(
        new apiResponse(200,createdUser,"User registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{

    //req body => data
    //username or emali
    //find the user
    //password check
    //access and refreshed token 
    //send cookies and response

    //input
    const {email,username,password} = req.body

    //check if user provided or not
    if(!(username || email)){
        throw new apiError(400,"username or email required")
    }

    //check in db if user present
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    //if user not exist throw error
    if(!user){
        throw new apiError(404,"User does not exist ")
    }

    //pawword check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401,"Password not valid")
    }

    //access tokens
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    //send cookie

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User loggedIn successfully "
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
                new:true
            }
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged out"))
})

const refreshingAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"Refresh token is expired or used")
        }

        const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        if(!accessToken || !newRefreshToken){
            throw new apiError(401,"error while generating new token")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(200,
                {accessToken,newRefreshToken},
                "Access token refreshed")
        )
    } catch (error) {
        throw new apiError(401,error?.message||"invalid refresh token")
    }




})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body

    //user password change ker raha mtlb vo ioggedin hai means middleware me user hai
    //so we can access user id ref:auth.middleware

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400,"invalid old password")
    }

    //update passsword
    user.password = newPassword
    await user.save({validateBeforeSave:false })

    return res.
    status(200)
    .json(new apiResponse(200,{},"password updated successfully"))




})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {fullName,email} = req.body

    if(!fullName || !email ){
        throw new apiError(400,"All field are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{fullName,email},
            new:true //update hone ke baad infoo return hoti hai
        }
     ).select("-password")

     return res.status(200)
     .json(200,user," account details changed successfully ")
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new apiError(400,"error while uploadig file to cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{avatar:avatar.url},
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new apiResponse(200,user,"avatar changed successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    
    if(!coverImageLocalPath){
        throw new apiError(400,"cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(avatarLocalPath)

    if(!coverImage){
        throw new apiError(400,"error while uploadig file to cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{coverImage:coverImage.url},
            new:true
        }
    ).select("-password")
    
    return res.status(200)
    .json(
        new apiResponse(200,user,"cover image changed successfully")
    )
})

export {registerUser,
    loginUser,
    logoutUser,
    refreshingAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}
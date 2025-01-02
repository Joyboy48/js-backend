import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"

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

export {registerUser}
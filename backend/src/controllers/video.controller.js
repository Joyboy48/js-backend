import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { pipeline } from "stream"
import { read } from "fs"


////////// Get all videos //////////
// 1. Get the page, limit, query, sortBy, sortType, userId from the request query(frontend) [http://localhost:8000/api/v1/video/all-video?page=1&limit=10&query=hello&sortBy=createdAt&sortType=1&userId=123]
// 2. Get all videos based on query, sort, pagination)
// 2.1 match the videos based on title and description
// 2.2 match the videos based on userId=Owner
// 3. lookup the Owner field of video and get the user details
// 4. addFields just add the Owner field to the video document
// 5. set options for pagination
// 6. get the videos based on pipeline and options
const getAllVideos = asyncHandler(async (req, res) => {
   const {
    page=1,
    limit=10,
    query="",
    sortBy="createdAt",
    sortType=1,
    userId="",
    isShort=""
   } = req.query

   // Build dynamic match stage
   const matchConditions = {
       isPublished: true,
       ...(query && {
           $or: [
               { title: { $regex: query, $options: "i" } },
               { description: { $regex: query, $options: "i" } }
           ]
       })
   };

   // Filter by isShort if provided
   if (isShort === "true")  matchConditions.isShort = true;
   if (isShort === "false") matchConditions.isShort = { $ne: true };

   // Add userId filter if provided
   if (userId && mongoose.isValidObjectId(userId)) {
       matchConditions.owner = new mongoose.Types.ObjectId(userId);
   }

   let pipeline = [
       {
           $match: matchConditions
       },
       {
           $lookup: {
               from: "users",
               localField: "owner",
               foreignField: "_id",
               as: "ownerDetails"
           }
       },
       {
           $addFields: {
               owner: {
                   $first: "$ownerDetails" // FIXED: Passed as a string, not a variable!
               }
           }
       },
       {
           $project: {
               "ownerDetails": 0, // Clean up the temp array
               "owner.password": 0,
               "owner.refreshToken": 0
           }
       },
       {
           $sort: {
               [sortBy]: sortType === "1" ? 1 : -1
           }
       }
   ];

    try {
        const options ={ 
            page:parseInt(page),
            limit:parseInt(limit),
            customLabels:{
                totalDocs:"totalVideos",
                docs:"videos"
            }
        }
        
       const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options)

       return res.status(200).json(
        new apiResponse(200, result, "Videos fetched successfully")
       )


    } catch (error) {
        console.error(error.message);
        return res
        .status(500)
        .json(
            new apiResponse(
                500,
                {},
                "Internal server error in video aggregation"
            )
        )
        
    }

})


////////// Publish a video //////////
// 1. Get the video file and thumbnail from the request body(frontend)
// 2. upload video and thumbnail to loacl storage and get the path
// 3. upload video and thumbnail to cloudinary 
// 4. create a video document in the database
const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    try {
        // 1. Get the video file and thumbnail from the request body(frontend)
        const { title, description, isShort } = req.body
        if([title,description].some((field)=>field.trim() === "")){
            throw new apiError(400,"please provider all given details")
        }

        // 2. upload video and thumbnail
        const videoLocalPath = req.files?.videoFile[0]?.path
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path

        if ( !videoLocalPath ) { throw new apiError( 400, "Please upload video" ) }
        if ( !thumbnailLocalPath ) { throw new apiError( 400, "Please upload thumbnail" ) }

        //3.upload on cloudinary
        const videoOnCloudinary = await uploadOnCloudinary(videoLocalPath,"myTube/video")
        const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath,"myTube/thumbnail")

        if ( !videoOnCloudinary ) { throw new apiError( 400, "video Uploading failed" ) }
        if ( !thumbnailOnCloudinary ) { throw new apiError( 400, "video Uploading failed" ) }

        // 4. create a video document in the database
        const video = await Video.create({
            title:title,
            description: description,
            thumbnail:thumbnailOnCloudinary?.url,
            videoFile:videoOnCloudinary?.url,
            duration:videoOnCloudinary?.duration,
            isPublished:true,
            isShort: isShort === "true" || isShort === true,
            owner:req.user?._id
        })

        if (!video) {
            throw new apiError(400,"video uploading failed")
        }

        return res
        .status(200)
        .json(
            new apiResponse(200,
                video,
                "video uploaded successfully"
            )
        )
} catch (error) {
        return res.status(501)
        .json(  new apiResponse(501,{},"Problem in uplaoding video"))
    }

})

////////// Get a video by id //////////
// 1. Get the video id from the request params(frontend)  [http://localhost:8000/api/v1/video/get-video/:videoId]
// 2. Check if the videoId id is valid
// 3. Find the video in the database
const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //TODO: get video by id
        if (!isValidObjectId(videoId)) {
            throw new apiError(400,"Enter a valid videoId")
        }
        const video = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$ownerDetails"
                    },
                    likes: {
                        $size: "$likes"
                    },
                    isLiked: {
                        $cond: {
                            if: { $in: [req.user?._id, "$likes.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "owner._id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $addFields: {
                    "owner.subscribersCount": {
                        $size: "$subscribers"
                    },
                    "owner.isSubscribed": {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    ownerDetails: 0,
                    subscribers: 0,
                    "owner.password": 0,
                    "owner.refreshToken": 0
                }
            }
        ]);

        if(!video?.length){
            throw new apiError(200,"failed to fetch video details")
        }

        // Increment video views
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        // Add to watch history if user is logged in
        if (req.user?._id) {
            await User.findByIdAndUpdate(
                req.user._id,
                { $addToSet: { watchHistory: videoId } }
            );
        }

        return res.status(200)
        .json(
            new apiResponse(200,
                video[0],
                "video fetched successfully"
            )
        )

    } catch (error) {
        res.status(501)
        .json(
            new apiResponse(501,{},"video not found")
        )
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //TODO: update video details like title, description, thumbnail
        if(!isValidObjectId(videoId)){
            throw new apiError(400,"Invaalid videoId")
        }

        const { title, description} = req.body
        if([title,description].some((field)=>field.trim() === "")){
            throw new apiError(400,"please provider all given details")
        }

        const video = await Video.findById(videoId)
        if (!video) {
            throw apiError(400,"videoId not found")
        }

        // 3.3 Check if the video is owned by the user [video.Owner.equals(req.user._id)] only owner can update the video
        if(!video.owner.equals(req.user?._id)){
            throw new apiError(400,"user not allowed to update")
        }

        const thumbnailLocalPath = req.file?.path
        if(!thumbnailLocalPath){throw new apiError(400,"thumbnail not found")}

        const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath,"myTube/thumbnail")
        if(!thumbnailOnCloudinary){throw new apiError(400,"error while uploading on cloudinary")}

        //delete
        const thumbnailOldUrl = video?.thumbnail
        const deleteThumbnail =await deleteFromCloudinary(thumbnailOldUrl,"myTube/thumbnail")
        if(!deleteThumbnail){throw new apiError(400,"thumbnail not deleted")}

        video.title=title,
        video.description=description,
        video.thumbnail=thumbnailOnCloudinary.url
        await video.save()

        return res
        .status(200)
        .json(
            new apiResponse(200,
                video,
                "video details updated successfuly"
            )
        )



    
    } catch (error) {
        console.log(error.stack);
        return res.status(500)
        .json(new apiResponse(500,{},"video details not updated"))
        
    }
})

////////// Delete a video //////////
// 1. Get the videoId from the request params(frontend)  [http://localhost:8000/api/v1/video/delete-video/:videoId]
// 2. find the video in the database by videoId and delete it
// 2.2. Check if the video is owned by the user [video.Owner.equals(req.user._id)] only owner can delete the video
// 3. delete the videoFile and thumbnail from cloudinary
// 4. Delete the video document from the database

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new apiError(400,"videoId not found")
    }

    if(!video.owner.equals(req.user?._id)){
        throw new apiError(400,"user not allowed to delete")
    }

    const videoFile = await deleteFromCloudinary(video.videoFile,"myTube/video")
    const thumbnailFile = await deleteFromCloudinary(video.thumbnail,"myTube/thumbnail")

    if(!videoFile && !thumbnailFile){
        throw new apiError(400,"thumbnail or videoFile is not deleted from cloudinary")
    }

     // 4. Delete the video document from the database
     await video.deleteOne();  // .remove dont work with findOne it only works with findById 

     return res.status(200)
     .json(new apiResponse(
        200,
        {},
        "video deleted successfully"
     ))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"invalid videoId")
    }

    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
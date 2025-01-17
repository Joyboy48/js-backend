import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
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
   
    //TODO: get all videos based on query, sort, pagination

   const {
    page=1,
    limit=10,
    query="",
    sortBy="createdAt",
    sortType=1,
    userId=""
   } = req.query

   let pipeline =[{
    $match:{
        $and:{
             // 2.1 match the videos based on title and description
            $or:[
                {
                    title:{
                        $regex:query,
                        $options:"i"
                    },
                    description:{
                         $regex:query,
                        $options:"i"
                    }
                },
                // 2.2 match the videos based on userId=Owner
                ...(userId?[{owner:mongoose.Types.ObjectId(userId)}]:"")
            ]
        }
    }},
    {
         // from user it match the _id of user with Owner field of video and saved as Owner
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[{ // project the fields of user in Owner 
                $project:{
                    _id:1,
                    fullName:1,
                    avatar:"$avatar.url",
                    username:1
                }
            }]
        }
    },
    {
        $addFields:{// 4. addFields just add the Owner field to the video documen
            owner:{
                $first:$owner  // $first: is used to get the first element of Owner array
            }
        }
    },
    {
        $sort:{
            [sortBy]:sortType  // sort the videos based on sortBy and sortType
        }
    }]

    try {
    // 5. set options for pagination
    const options ={  // options for pagination
        page:parseInt(page),
        limit:parseInt(limit),
        customLabels:{
            totalDocs:"totalVideos",
            docs:"videos"
        }

    }
       // 6. get the videos based on pipeline and options
       const result = await Video.aggregatePaginate(Video.aggregate(pipeline),options)

       if(result?.videos?.length === 0){
        return res.status(404).json(new apiResponse(404,{},"no video found"))
       }

       return res.status(200).json(
        new apiResponse(200,result,"Video fetched successfully")
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

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    try {
        const { title, description} = req.body
        
    } catch (error) {
        
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
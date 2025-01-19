import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"invalid videoId")
    }

    const isLiked = await Like.findOne({
        $and:[
            {likedBy:req.user?._id},
            {video:videoId}
        ]
    })

    if(!isLiked){
        const like =await Like.create({
            likedBy:req.user?._id,
            video:videoId
        })

        return res
        .status(200)
        .json(
            new apiResponse(200,like,"like added")
        )
    }

    const unlike = await Like.findByIdAndDelete(isLiked._id)

    return res
        .status(200)
        .json(
            new apiResponse(200,unlike,"like removed")
        )


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new apiError(400,"invalid commentId")
    }

    const isLiked = await Like.findOne({
        $and:[
            {likedBy:req.user?._id},
            {comment:commentId}
        ]
    })

    if(!isLiked){
        const like =await Like.create({
            likedBy:req.user?._id,
            comment:commentId
        })

        return res
        .status(200)
        .json(
            new apiResponse(200,like,"like added")
        )
    }

    const unlike = await Like.findByIdAndDelete(isLiked._id)

    return res
        .status(200)
        .json(
            new apiResponse(200,unlike,"like removed")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"invalid tweetId")
    }

    const isLiked = await Like.findOne({
        $and:[
            {likedBy:req.user?._id},
            {tweet:tweetId}
        ]
    })

    if(!isLiked){
        const like =await Like.create({
            likedBy:req.user?._id,
            tweet:tweetId
        })

        return res
        .status(200)
        .json(
            new apiResponse(200,like,"like added")
        )
    }

    const unlike = await Like.findByIdAndDelete(isLiked._id)

    return res
        .status(200)
        .json(
            new apiResponse(200,unlike,"like removed")
        )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.findOne({
        $and:[
            {likedBy:req.user?._id},
            {video:{$exists:true}}
        ]
    })

    if(!likedVideos){
        throw new apiError(400,"liked video not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            likedVideos,
            "liked video fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
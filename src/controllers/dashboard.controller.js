import mongoose ,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"
import { User } from "../models/user.models.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // 1. get channel from req.body or req.params
    let {channel} = req.body

    if(!channel){
        throw new apiError(400,"Please provide channel")
    }

    // 2. find the channel using the username  get the channelID

    channel = await User.findOne(
        {username:channel}
    )

    if(!channel){
        throw new apiError(400,"channel not found")  
      }

    //get the channelID
    const channelId = await new  mongoose.Types.ObjectId(channel?._id)

    if(!isValidObjectId(channelId)){
        throw new apiError(400,"non valid channel id")
    }

    const totalViewsAndVideos = await Video.aggregate([
        {
            $match:{
                //$match removes all other videos and keeps only the ones that meet your criteria.
                $and:[
                    //The $and operator in MongoDB is used to combine multiple conditions in a query. It ensures that all the conditions specified must be true for a document to be included in the results.
                    {
                        owner: new mongoose.Types.ObjectId(channelId)
                    },
                    {
                        isPublished:true
                    }
                ]
            }
        },
        //$group can count how many videos there are and add up all the views for those videos.
        {
            $group:{
                _id:"$owner",
                totalViews:{
                    $sum:"$views"
                },
                totalVideos:{
                    $sum:1
                }
            }
        }
    ])

    const totalSubscriber = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            },
            
        },
        {
            $count:"totalSubscribers"
        }
    ])

    const totalTweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            },
            
        },
        {
             $count:"totalTweets"
        }
    ])

    const totalComments = await Comment.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            },
            
        },
        {
             $count:"totalComments"
        }
    ])

    const totalVideoLikes = await Like.aggregate([
        {
            $match:{
                $and:[
                    {
                        likedBy:new mongoose.Types.ObjectId(channelId)
                    },
                    {
                        video:
                        {
                            $exists:true
                        }
                    }
                ]
            }
        },
        {
            $count:"totalVideosLiked"
        }
    ])

    const totalCommentLikes = await Like.aggregate([
        {
            $match:{
                $and:[
                    {
                        likedBy:new mongoose.Types.ObjectId(channelId)
                    },
                    {
                        comment:
                        {
                            $exists:true
                        }
                    }
                ]
            }
        },
        {
            $count:"totalCommentsLiked"
        }
    ])

    const totalTweetLikes  = await Like.aggregate([
        {
            $match:{
                $and:[
                    {
                        likedBy:new mongoose.Types.ObjectId(channelId)
                    },
                    {
                        tweet:
                        {
                            $exists:true
                        }
                    }
                ]
            }
        },
        {
            $count:"totalTweetsLiked"
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200,
            {
                "totalViews": totalViewsAndVideos[ 0 ]?.totalViews,
                "totalVideos": totalViewsAndVideos[ 0 ]?.totalVideos,
                "totalSubs": totalSubscriber[ 0 ]?.totalSubcribers,
                "totalTweets": totalTweets[ 0 ]?.totalTweets,
                "totalComments": totalComments[ 0 ]?.totalComments,
                "totalVideoLikes": totalVideoLikes[ 0 ]?.totalVideoLiked,
                "totalCommentLikes": totalCommentLikes[ 0 ]?.totalCommentLiked,
                "totalTweetLikes": totalTweetLikes[ 0 ]?.totalTweetLiked
            }, "Stats of the channel fetched successfully"
        )
    )

    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    
    if (!req.user?._id) throw new apiError(404, "Unauthorized request");

    const videos = await Video.find({
        owner: req.user._id
    })

    if (!videos[0]) {
        return res.status(200)
            .json(new apiResponse(200, [], "No videos found"))
    }

    return res.status(200)
        .json(new apiResponse(200, videos, "Total videos fetched successfully"))


})

export {
    getChannelStats, 
    getChannelVideos
    }
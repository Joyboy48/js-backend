import mongoose ,{Aggregate, isValidObjectId} from "mongoose"
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

    const totalSubscribers = await Subscription.aggregate([
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
                "totalViews": totalViewsAndVideos[0]?.totalViews,
                "totalVideos": totalViewsAndVideos[0]?.totalVideos,
                "totalSubs": totalSubscribers[0]?.totalSubscribers,
                "totalTweets": totalTweets[0]?.totalTweets,
                "totalComments": totalComments[0]?.totalComments,
                "totalVideoLikes": totalVideoLikes[0]?.totalVideosLiked,
                "totalCommentLikes": totalCommentLikes[0]?.totalCommentsLiked,
                "totalTweetLikes": totalTweetLikes[0]?.totalTweetsLiked
            }, "Stats of the channel fetched successfully"
        )
    )

    // if (!req.user?._id) throw new apiError(404, "Unauthorized request");

    // const userId = req.user?._id

    // const channelStats = await Video.aggregate([
    //     {
    //         $match:{
    //             owner:userId
    //         }
    //     },
    //     // Lookup for Subscribers of a channel
    //     {
    //         $lookup:{
    //             from:"subscriptions",
    //             localField:"owner",
    //             foreignField:"channel",
    //             as:"subscribers"
    //         },
    //     },
    //     // Lookup for the channel which the owner Subscribe
    //     {
    //         $lookup:{
    //             from:"subscriptions",
    //             localField:"owner",
    //             foreignField:"subscriber",
    //             as:"subscribedTo"
    //         }
    //     },
    //     // Lookup likes for the user's videos
    //     {
    //         $lookup:{
    //             from:"likes",
    //             localField:"_id",
    //             foreignField:"video",
    //             as:"likedVideo"
    //         }
    //     },
    //     // Lookup comments for the user's videos
    //     {
    //         $lookup:{
    //             from:"comments",
    //             localField:"_id",
    //             foreignField:"video",
    //             as:"videoComments"
    //         }
    //     },
    //      // Lookup tweets by the user
    //     {
    //         $lookup:{
    //             from:"tweets",
    //             localField:"owner",
    //             foreignField:"owner",
    //             as:"tweets"
    //         }
    //     },
    //     {
    //         $group:{
    //             _id: null,
    //             totalVideo:{$sum:1},
    //             totalView:{$sum:"$views"},
    //             subscribers: { $first: "$subscribers" },
    //             subscribedTo: { $first: "$subscribedTo" },
    //             totalLikes: { $sum:  {$size: "$likedVideo"} },
    //             totalComments: { $sum: { $size: "$videoComments" } },
    //             totalTweets: { $first: { $size: "$tweets" } },

    //         }
    //     },
    //     {
    //         $project: {
    //           _id: 0,
    //           totalVideos: 1,
    //           totalViews: 1,
    //           subscribers: { $size: "$subscribers" },
    //           subscribedTo: { $size: "$subscribedTo" },
    //           totalLikes: 1,
    //           totalComments: 1,
    //           totalTweets: 1,
    //         },
    //       },


    // ])

    // return res
    //     .status(200)
    //     .json(
    //       new apiResponse(
    //         200,
    //         channelStats,
    //         "Channel stats fetched successfully"
    //       )
    //     );



    
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
    
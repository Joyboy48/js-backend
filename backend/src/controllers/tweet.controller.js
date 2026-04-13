import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { application } from "express"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //1.get content
    //2.send it to db
    const {content} = req.body

    if(!content){
        throw new apiError(400,"content not found")
    }

    const tweet = await Tweet.create({
        owner:req.user?._id,
        content:content,
    })

    if(!tweet){
        throw new apiError(400,"tweet not posted")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,tweet,"Tweet posted")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    //get user id from params
    //find list of all tween from user
    //return

    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid userId")
    }

    const userTweets = await Tweet.find({
        owner:userId
    })

    if(!userTweets.length === 0){
        throw new apiError(500,"No tweet found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                "total_tweet":userTweets.length,
                "tweet":userTweets
            },
            "Tweet fetched successfully"

        )
    )
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // 1. get tweetId from params URL and content from req.body
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"tweetId does not exist")
    }

    if(!content){
        throw new apiError(400,"content nont found")
    }

    //find the tweet by tweetId and req.user._id. 
    const findTweet = await Tweet.findOne({
        $and:[
            {owner:new mongoose.Types.ObjectId(req.user?._id)},
            {_id:tweetId}
        ]
    })

    if(!findTweet){
        throw new apiError(400,"owner id or tweetid not matched")
    }

    //update the tweet content and save it to the database
    findTweet.content = content
    const updateTweet = await findTweet.save()

    if(!updateTweet){
        throw new apiError(400,"tweet was not updated")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            updateTweet,
            "Tweet updated successfully"
        )
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params

    
    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"tweetId does not exist")
    }

    const findTweet = await Tweet.findOne({
        $and:[
            {owner:new mongoose.Types.ObjectId(req.user?._id)},
            {_id:tweetId}
        ]
    })

    if(!findTweet){
        throw new apiError(400,"owner id or tweetid not matched")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new apiResponse(200,{},"tweet deleted successfully")
    )



})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
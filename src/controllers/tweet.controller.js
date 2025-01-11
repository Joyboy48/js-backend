import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //1.get content
    //2.send it to db
    const {content} = req.body

    if(!content){
        throw new apiError(400,"content not found")
    }

    const tweet = await Tweet.create({
        order:req.user?._id,
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
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
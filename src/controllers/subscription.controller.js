import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new apiError(400,"unauthrized access")
    }

    const subscribed = await Subscription.findOne({
        $and:[
            {
                channel:channelId
            },
            {
                subscriber:req.User?._id
            }
        ]
    })

    if(!subscribed){
       const subscribe = await Subscription.create({
        subscriber:req.User?._id,
        channel:channelId
       })

       if(!subscribe){
        throw new apiError(500,"Internal Server Error: Unable to create subscription")
     }
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,
            subscribed,
            "channel subscribed"
        )
    )

    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
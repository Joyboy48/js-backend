import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Channel ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Invalid Channel ID");
    }

    const userId = req.user._id;

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    });

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new apiResponse(200, {}, "Unsubscribed successfully"));
    } else {
        // Subscribe
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: userId
        });

        if (!newSubscription) {
            throw new apiError(500, "Subscription failed");
        }

        return res.status(200).json(new apiResponse(200, newSubscription, "Subscribed successfully"));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params //subscriberId represents the ID of the channel whose subscribers are being fetched.
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
      }
      const subscribersList = await Subscription.aggregate([
        {
          $match: {
            channel: new mongoose.Types.ObjectId(subscriberId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriber",
            pipeline: [
              {
                $project: {
                  username: 1,
                  fullName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            subscriber: {
              $first: "$subscriber",
            },
          },
        },
        {
          $project: {
            subscriber: 1,
            createdAt: 1,
          },
        },
      ]);
    
      if (!subscribersList) {
        throw new apiError(400, "Error Fetching Subscribers List");
      }
    
      return res
        .status(200)
        .json(
          new apiResponse(200, subscribersList, "Subscribers Fetched Successfully")
        );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                username: "$channelDetails.username",
                fullName: "$channelDetails.fullName",
                avatar: "$channelDetails.avatar",
                coverImage: "$channelDetails.coverImage"
            }
        }
    ]);

    if (!subscriptions.length) {
        throw new apiError(404, "No subscriptions found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}


import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new apiError(500,"invalid videoId")
    }

    let pipeline = [
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        }
    ]

    const options = {
        page:parseInt(page),
        limit:parseInt(limit),
        customLabels:{
            totalDocs:"total_coments",
            docs:"comments"
        }

    }

    const allComments = await Comment.aggregatePaginate(pipeline,options)

    if(allComments?.total_coments === 0){
        throw new apiError(400,"comment not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                "comments":allComments,
                "size":allComments.length
            },
            "comments fetched successfully"

        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content}= req.body

    if(!isValidObjectId(videoId)){
        throw new apiError(500,"invalid videoId")
    }

    if(!content){
        throw new apiError(400,"please enter valid commet")
    }

    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:new mongoose.Types.ObjectId(req.user?._id)
    })

    if(!comment){
        throw new apiError(400,"coment not saved in DB")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            comment,
            "comment added successfully"
        )
    )


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content}= req.body

    if(!isValidObjectId(commentId)){
        throw new apiError(500,"invalid videoId")
    }

    if(!content){
        throw new apiError(400,"please enter valid commet")
    }
    const comment = await Comment.findOne({
        _id:commentId,
        owner:req.user?._id
    })

    if(!comment){
        throw new apiError(400,"coment not f0und")
    }

    comment.content = content
    await comment.save()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            comment,
            "comment updated successfully"
        )
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
  

    if(!isValidObjectId(commentId)){
        throw new apiError(500,"invalid videoId")
    }

    const deletecomment = await Comment.deleteOne({
        $and:[
            {_id:commentId},
            {owner:req.user?._id}
        ]
    })

    if(!deletecomment){
        throw new apiError(400,"coment not found")
    }

     // 3. if deletedCount is 0, return an error message
    // delComment will return object -> { acknowledged: true, deletedCount: 0 }
    // deletedCount:0 means comment found and not deleted
    // deletedCount:1 means comment found and deleted
    if ( deletecomment.deletedCount === 0 ) { 
        return res
        .status( 500 )
        .json( 
            new apiError( 
                500, 
                "You are not authorized to delete this comment" ) ) }

    return res
    .status(200)
    .json(
        new apiResponse(
           200,
           {},
           "comment deleted successfully" 
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
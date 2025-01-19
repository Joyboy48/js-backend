import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name && !description){
        throw new apiError(400,"please enter the naem and description ")
    }

    const createPlaylist = await Playlist.create({
        name:name,
        description:description,
        owner:new mongoose.Types.ObjectId(req.user?._id)
    })

    if(!createPlaylist){
        throw new apiError(400,"playlist not create try again")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            createPlaylist,
            "playlist created successfully"
        )
    )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new apiError(400,"user not found")
    }

    const getPlaylist = await Playlist.find({
        owner:userId
    })

    if(!getPlaylist){
        throw new apiError(400,"playlist not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            getPlaylist,
            "playlist found successfully!"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw apiError(400,"invalid playlist")
    }

    const findPlaylist = await Playlist.findById(playlistId)

    if(!findPlaylist){
        throw new apiError(400,"not playlist found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            findPlaylist,
            "playlist founs successfully"
        )
    )

    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
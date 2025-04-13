import { Router } from "express";
import { addVideoToPlaylist, createPlaylist,deletePlaylist,getplaylistById,removeVideoFromPlaylist,updatePlaylist,userPlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/create").post(createPlaylist)
router.route("/user/:userId").get(userPlaylist)
router.route("/:playlistId")
.get(getplaylistById)
.patch(updatePlaylist)
.delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").post(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").post(removeVideoFromPlaylist)


export default router
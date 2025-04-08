import { upload} from "../middlewares/multer.middleware.js"
import { Router } from "express"
import { loginUser, logOutuser, refreshAccessToken, registerUser,changeCurrentUserPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getUserWatchHistory } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutuser)

router.route("/refresh").post(refreshAccessToken)

router.route("/changePassword").post(verifyJWT,changeCurrentUserPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/updateAccount").patch(verifyJWT,updateAccountDetails)

router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/updateCoverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/profile").get(verifyJWT,getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT,getUserWatchHistory)


export default router
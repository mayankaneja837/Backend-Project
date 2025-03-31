import { upload} from "../middlewares/multer.middleware.js"
import { Router } from "express"
import { loginUser, logOutuser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
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
export default router
import {Router} from "express"
import { logoutUser, registerUser ,loginUser,refreshAccessToken,changePassword, getUserChannelProfile,getCurrentUser,updateUserProfile,getWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT,optionalVerifyJWT } from "../middlewares/auth.middleware.js"

const router= Router()



router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT,logoutUser) 
router.route("/refresh-token").post(refreshAccessToken) 
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/channel/:username").get(optionalVerifyJWT,getUserChannelProfile)
router.route("/me").get(verifyJWT,getCurrentUser)
router.route("/me").patch(verifyJWT,upload.fields([
    {
        name: "avatar",
        maxCount:1  
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),updateUserProfile)

router.route("/watch-history").get(verifyJWT,getWatchHistory)



export default router
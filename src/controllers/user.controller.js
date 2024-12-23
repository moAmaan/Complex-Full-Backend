import { asyncHandle } from "../utils/asyncHandler.js";

const registerUser = asyncHandle( async(req,res) => {
    res.status(200).json({
        message : "OK"
    })
})

export {registerUser}
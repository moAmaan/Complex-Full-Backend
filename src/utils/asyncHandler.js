const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }


// const asyncHandle = (fn) => async (req,res,next)=> {
//     try {
//             await fn(req,req,next)
//         } catch (error) {
//                 res.status(error.code).json({
//                         success : false,
//                         message : error.message
//                     })
//                 }
//             }
//             export {asyncHandle}

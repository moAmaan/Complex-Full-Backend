const asyncHandle = (requestHandler) => {
    return (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).reject((error) => {
    next(error);
  });
}};

export {asyncHandle}

// const asyncHandle = (fn) => async (req,res,next)=> {
//     try {
//         await fn(req,req,next)
//     } catch (error) {
//         res.status(error.code).json({
//             success : false,
//             message : error.message
//         })
//     }
// }

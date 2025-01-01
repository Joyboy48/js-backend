// * A utility function to handle errors in asynchronous route handlers.
// * This ensures that any errors thrown by async functions are caught
// * and passed to the next middleware (typically an error handler).

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    // Ensure the requestHandler is executed and wrapped in a Promise
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    // If the Promise rejects, pass the error to the next middleware
  };
};

export { asyncHandler };

// const asyncHandler = (func)=>async(req,res,next)=>{
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }

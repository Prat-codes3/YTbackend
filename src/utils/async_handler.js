
const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error); // send or forward error to error middleware
     
    }
  };
};

export {asyncHandler}



// asyncHandler	
// For request lifecycle	
// Runs per request	
// Sends HTTP response	
// Uses next(error)


// Use it ONLY in:

// 1 Controllers
// 2  Routes
// 3 Request-level logic

// mental map:
// SERVER STARTUP
//  ├─ connectDB()  ❗must succeed
//  └─ app.listen()

// REQUEST COMES
//  ├─ asyncHandler()
//  ├─ controller logic
//  └─ error middleware
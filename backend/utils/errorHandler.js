const errorHandler = (fn) => {
    console.log("errorHandler called");
    return async (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
 
export default errorHandler;
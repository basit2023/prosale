const customMiddleware=(req, res, next)=> {
    const { pathname } = req.url;
    console.log("the url is:",req)
    // Perform permission checks based on the pathname
  
    next();
  }
  module.exports = { customMiddleware };
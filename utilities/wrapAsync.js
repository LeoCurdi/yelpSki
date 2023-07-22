/*  
    this code let's you wrap an async function in a try catch

    if an error is thrown in a function that is passed to this function,
    this function will return a function that will catch the error and call next
*/
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
module.exports = (fn) => {
  return (req, res, next) => {
    //fn(req, res, next).catch(err=> next(err));
    // Same as
    fn(req, res, next).catch(next);
  };
};

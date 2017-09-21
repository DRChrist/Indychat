module.exports = function(req, res, next) {
	if(req.session.userId) {
		return next();
	}

	if(req.wantsJSON) {
		return res.forbidden('Access Denied!');
	}

	return res.redirect('/');
};
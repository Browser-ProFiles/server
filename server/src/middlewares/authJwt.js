const JwtService = require('../services/jwt');

class JwtMiddleware {
    verify(req, res, next) {
        const bearer = req.header('Authorization') || '';
        const token = bearer.split(' ')[1];
        const valid = JwtService.verify(token);
        const decodedData = JwtService.decode(token);
        req.user = decodedData?.payload || decodedData;
        return valid ? next() : res.status(401).send({
            error: req.appLang === 'en' ? 'Unauthorized' : 'Необходимо авторизоваться'
        });
    }

    hasRole(role) {
        return (req, res, next) => {
            const bearer = req.header('Authorization') || '';
            const token = bearer.split(' ')[1];
            const decoded = JwtService.decode(token);
            const foundRole = decoded.payload.roles.find(e => e.role === role);
            return foundRole ? next() : res.status(403).send({
                error: req.appLang === 'en' ? 'Access Denied' : 'Нет доступа'
            });
        }
    }

    hasAllRoles(roles) {
        return (req, res, next) => {
            const bearer = req.header('Authorization') || '';
            const token = bearer.split(' ')[1];
            const decoded = JwtService.decode(token);
            const foundAllRoles = roles.every(e => decoded.payload.roles.find(i => i.role === e));
            return foundAllRoles ? next() : res.status(403).send({
                error: req.appLang === 'en' ? 'Access Denied' : 'Нет доступа'
            });
        }
    }

    hasAnyRole(roles) {
        return (req, res, next) => {
            const bearer = req.header('Authorization') || '';
            const token = bearer.split(' ')[1];
            const decoded = JwtService.decode(token);
            const foundAnyRole = roles.some(e => decoded.payload.roles.find(i => i.role === e));
            return foundAnyRole ? next() : res.status(403).send({
                error: req.appLang === 'en' ? 'Access Denied' : 'Нет доступа'
            });
        }
    }

}

module.exports = new JwtMiddleware();

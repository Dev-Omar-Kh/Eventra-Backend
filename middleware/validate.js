const validate = (schema) => (req, res, next) => {

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const messages = error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message
        }));
        return res.status(400).json({ errors: messages });
    }

    req.body = value;
    next();

};

module.exports = validate;

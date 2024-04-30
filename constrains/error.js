function getDuplicateError() {
    let error = new Error("Duplicate Error");
    error.message = "This record is already existing in the system."
    error.errorCode = 409;
    return error;
}

function getNotFoundError() {
    let error = new Error("Not Found Error");
    error.message = "This record can not be found in the system."
    error.errorCode = 404;
    return error;
}

function getDatabaseError(message) {
    let error = new Error("Database Error");
    error.message = message;
    error.errorCode = 500;
    return error;
}

function getAuthenticationError(err) {
    let error = new Error();
    error.message = err.message;
    error.errorCode = 400;
    return error;
}

module.exports = { getDuplicateError, getNotFoundError, getDatabaseError, getAuthenticationError }
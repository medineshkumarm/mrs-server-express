const mongoose = require('mongoose');

class ValidationUtils {
  static isValidDate(date) {
    return !isNaN(new Date(date).getTime());
  }

  static isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }
}

module.exports = ValidationUtils;
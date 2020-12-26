const Appointment = require("../src/models/Appointment");

class AppError {
  constructor(message, status = 400){
    this.status = status;
    this.message = message;
  }
}

module.exports = AppError;
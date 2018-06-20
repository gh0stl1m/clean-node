// Modify the error class to store
class BusinessError extends Error {
  constructor(message, moduleName) {
    super(message);
    // Saving class name and moduleName in the property of our custom error as a shortcut.
    this.moduleName = moduleName;
    this.name = this.constructor.name;
    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BusinessError;
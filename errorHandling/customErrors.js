class customDataError extends Error {
  constructor(message) {
    super(message); 
    this.type = "customError";
    this.error = "lastfmError"
  }
}

class notEnoughDataError extends customDataError {
  constructor(message) {
    super(message); 
    this.error = "Not enough data returned from user profile to run this command.";
  }
}

class notFound extends customDataError {
  constructor(query) {
    super(query); 
    this.error = `Search for \`${query}\` returned no results.`;
  }
}

module.exports = {
  notEnoughDataError: notEnoughDataError,
  notFound: notFound
}
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

class registerError extends customDataError {
  constructor(message) {
    super(message); 
    this.error = "User does not seem to have a linked account, you can search for a last.fm profile by specifying a username.  Contact the bot owner to have your account linked.";
  }
}

module.exports = {
  notEnoughDataError: notEnoughDataError,
  notFound: notFound
}
// Parses out the actual keyword search body from the message
const parseMessageKeywords = (message) => {
  if ((message !== null) && (typeof message !== 'undefined')) {
    // Assumes message.text contains at least the action
    var message_parts = message.split(' ', 2);
    if (message_parts.length == 2) {
      // Assumes message_parts are action and keyword
      // Return the part after the action identifier
      return message_parts[1];
    }
  }
  return ''; // TODO replace with exception
};

// Parses out the actual action from the message
const parseMessageAction = (message) => {
  if ((message !== null) && (typeof message !== 'undefined')) {
    var message_parts = message.split(' ');
    if (message_parts.length > 0) {
      // Assumes message_parts are action and whatever is left
      // Return the action identifier
      return message_parts[0].toLowerCase();
    }
  }
  return ''; // TODO replace with exception
};


module.exports = { parseMessageKeywords, parseMessageAction };

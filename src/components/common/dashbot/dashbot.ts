const dashbot = require('dashbot')('wtmrV62FNiK4sEfys7xFM4xuoVIQpp2NxjU89ZVR').universal;

const logIncoming = (text: string, userId: string, payload = {}) => {
  const messageForDashbot = {
    text: text,
    userId: userId,
    platformJson: payload,
  };

  // console.log('@messageForDashbot', messageForDashbot);
  dashbot.logIncoming(messageForDashbot);
};

const logOutgoing = (text: string, userId: string, payload = {}) => {
  const messageForDashbot = {
    text: text,
    userId: userId,
    platformJson: payload,
  };

  // console.log('@messageForDashbot', messageForDashbot);
  dashbot.logOutgoing(messageForDashbot);
};

export {
  logIncoming,
  logOutgoing,
};


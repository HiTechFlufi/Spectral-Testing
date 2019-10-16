/*************************
*         PAIGE          *
*    Showdown Chat AI    *
*    Written by flufi    *
*************************/

"use strict";

// Configuration

let config = {
  version: "0.1",
  stage: "Limited-Access Alpha",
  admin: ["flufi", "ragininfernape"],
  changelog: ["First Release!", "Basic Experimental Question/Statement Answering"],
};

let template = {
  insult: "You are mom is gay bitch dumbass fucker",
  compliment: "You are pretty nice sweet cute cool like",
};

// Variables

const paige = `|html|<font color="#943B5E"><strong>Paige:</strong></font>`;
let yesNoId = ["is", "are", "can", "then"];
let insultId = ["bitch", "dumbass", "fucker", "motherfucker", "cunt", "asshole", "cretin", "pleb", "shithead", "fuckhead", "assface", "asshat"];
let complimentId = ["nice", "awesome", "great", "epic", "cool", "cute", "beautiful", "adorable", "amazing", "incredible"];
let greetingId = ["hey", "hi", "hello", "howdy", "sup", "wassup", "whats up", "hiya", "heya", "yo", "bonjour", "konichiwa", "hola", "ciao", "hii", "heyy"];
let questionType;
let formattedMessage;
let containsInsult;
let containsCompliment;

let response;
let randomUser;

let esp = ['.', '..', '...', '!'];

let answers = {
  yesNo: ["Yes", "Yup", "Yep", "Yeah", "No", "Nope", "Nah", "Beats me", "I don't know", "How would I know", "No idea"],
  dontUnderstand: ["Huh?", "What?", "I don't get it..", "I don't understand.", "Pardon?", "Excuse me?", "Excuse you?", "Can you repeat that in English?", "Can you repeat that in Spanish?", "Can you repeat that in Portuguese?", "I don't speak Japanese.", "I don't speak Italian."],
  retaliation: ["That's not nice", "That hurt my feelings", "Why would you say something so rude", "Right back at you", "Right back at you, shithead", "Right back at you, asshole", "nou"],
  thankYou: ["Thanks", "Thank you", "I appreciate it", "Don't make me blush", "Thanks a lot"],
  greetings: ["Hey", "Hi", "Hello", "Howdy", "Sup", "Wassup", "What's up", "Hiya", "Heya", "Yo", "Bonjour", "Konichiwa", "Hola", "Ciao", "Hii", "Heyy"],
};

// Functions

function analyzeType(message) {
  let firstWord = message.replace(/ .*/,'');
  if (yesNoId.includes(firstWord)) {
    questionType = "yesNo";
  } else if (firstWord === "who") {
    questionType = "who";
  } else if (greetingId.includes(firstWord)) {
    questionType = "greeting";
  } else {
    questionType = "other";
  }
  return questionType;
}

function findResponse(message) {
  let firstWord = message.replace(/ .*/,'');
  // Easter Eggs & Specific Statements
  if (message === "who made you" || message === "who are you" ||message.includes("creator")) return response = "I'm a chat AI, and created me. Not very well though; Sorry if I can't reply to your basic English sentences.";  
  if (message === "what is the meaning of life" || message === "the meaning of life" || message === "meaning of life" || message.includes("meaning") && message.includes("life")) return response = "There is none.";
  if (message === "what is your name") return response = "I'm Paige. Nice to meet you.";  
  if (questionType === "other") {
    // Find Similarities
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    let insultTotal = 0;
    let compTotal = 0;
    // Insult?
    for (let insult of insultId) {
      if (message.includes(insult)) containsInsult = true;
    }
    for (let ch of alphabet) {
      if (message.indexOf(ch) > -1 && template.insult.indexOf(ch) > -1) insultTotal++;
    }
    // Compliment?
    for (let comp of complimentId) {
      if (message.includes(comp)) containsCompliment = true;
    }
    for (let ch of alphabet) {
      if (message.indexOf(ch) > -1 && template.compliment.indexOf(ch) > -1) compTotal++;
    }
    // Set Responses
    if (insultTotal >= 8 || containsInsult === true) {
      response = answers.retaliation[Math.floor(Math.random() * answers.retaliation.length)] + esp[Math.floor(Math.random() * esp.length)];
    } else if (compTotal >= 6 || containsCompliment === true) {
      response = answers.thankYou[Math.floor(Math.random() * answers.thankYou.length)] + esp[Math.floor(Math.random() * esp.length)];
    } else {
      response = answers.dontUnderstand[Math.floor(Math.random() * answers.dontUnderstand.length)];
    }
  } else {
    // Other Question Types
    if (questionType === "yesNo") {
      response = answers.yesNo[Math.floor(Math.random() * answers.yesNo.length)] + esp[Math.floor(Math.random() * esp.length)];
    } else if (questionType === "who") {
      let userList = [];
      let users = Rooms.get("lobby").users;
      let user;
      for (user in users) {
        userList.push(Rooms.get("lobby").users[user].id);
      }
      let randomUser = userList[Math.floor(Math.random() * userList.length)];
      let whoAnswers = [`It was ${randomUser}`, `I'm pointing my finger at ${randomUser}`, `${randomUser}, probably`, `Maybe it was ${randomUser}`, `It was definitely ${randomUser}`, `Blame ${randomUser}`, `Always blame ${randomUser}`];
      response = whoAnswers[Math.floor(Math.random() * whoAnswers.length)] + esp[Math.floor(Math.random() * esp.length)];
    } else if (questionType === "greeting") {
      response = answers.greetings[Math.floor(Math.random() * answers.greetings.length)] + esp[Math.floor(Math.random() * esp.length)];
    }
  }
  return response;
}

function format(message) {
  let uncapitalized = message.toLowerCase();
  let punctuationless = uncapitalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`'~()]/g,"");
  let noShorthand = punctuationless.replace(/howre/,"how are").replace(/hows/,"how is").replace(/whos/,"who is").replace(/whore/,"who are").replace(/whats/,"what is").replace(/wont/,"will not").replace(/wouldnt/,"would not").replace(/hadnt/,"had not").replace(/dont/,"do not").replace(/im/,"i am").replace(/youre/,"you are").replace(/were/,"we are").replace(/wheres/,"where is").replace(/whens/,"when is").replace(/whys/,"why is").replace(/hows/,"how is").replace(/its/,"it is").replace(/hes/,"he is").replace(/shes/,"she is").replace(/wouldve/,"would have").replace(/shouldnt/,"should not");
  let finalMessage = noShorthand.replace(/\s{2,}/g," ");
  formattedMessage = finalMessage;
  return formattedMessage;
}

// Commands

exports.commands = {
  paige: {
    info(target, room, user) {
      if (!this.runBroadcast()) return;
      let i;
      let changes = ``;
      for (i = 0; i < config.changelog.length; i++) {
        changes += `• ${config.changelog[i]}<br />`
      }
      return this.sendReplyBox(`<font size="5"><u>Paige</u></font><br /><br />v${config.version} ${config.stage}<br />Written by flufi<br /><br /><b>Changelog:</b><br /><br />${changes}`);
    },
    sudo(target, room, user) {
      if (!this.runBroadcast()) return;
      if (!config.admin.includes(user.id)) return this.errorReply(`You do not have access to Paige.`);
      return this.sendReply(`${paige} ${target}`);
    },

    calibrate(target, room, user) {
      if (!this.runBroadcast()) return;
      if (!config.admin.includes(user.id)) return this.errorReply(`You do not have access to Paige.`);
      return this.sendReply(`${paige} My calibrate feature isn't implemented yet.`);
    },

    ask(target, room, user) {
      if (!this.runBroadcast()) return;
      let message;
      format(target);
      analyzeType(formattedMessage);
      findResponse(formattedMessage);
      return this.sendReply(`${paige} ${response}`);
    },

    similarity(target, room, user) {
      if (!this.runBroadcast()) return;
      let [string1, string2] = target.split(",").map(p => p.trim());
      if (!string1 || !string2) return this.errorReply(`Please provide two words or sentences separated by a comma.`);
      let alphabet = "abcdefghijklmnopqrstuvwxyz";
      let total = 0;
      for (let ch of alphabet) {
        if (string1.indexOf(ch) > -1 && string2.indexOf(ch) > -1) total++;
      }
      this.sendReply(`|html|These two strings have <b>${total}</b> characters in common.`);
    },
  },
};

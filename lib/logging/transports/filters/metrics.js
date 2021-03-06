/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * message filter for metrics messages.
 */

const _ = require('underscore');
const coarse = require('../../../coarse_user_agent_parser');

var MessageMatches = {
  signin: true,
  verify: true
};

var RegExpMatches = [
  /^metrics\.report\./
];

exports.test = function(msg) {
  if (msg in MessageMatches) return true;

  for (var i = 0, regExp; regExp = RegExpMatches[i]; ++i) {
    if (regExp.test(msg)) return true;
  }

  return false;
};

exports.toType = function(msg) {
  return msg.replace(/^metrics\.report\./, '');
};

exports.toEntry = function(msg, entry) {
  // create a copy of the entry so that changing fields does not have
  // side effects elsewhere.
  if (typeof entry === 'object') entry = _.extend({}, entry);

  // allow convenient reporting of atoms by converting atoms into objects
  if (entry === null || typeof entry !== 'object') entry = { msg: entry };
  if (entry.type)
    throw "reported metrics may not have a `type` property, that's reserved";
  entry.type = exports.toType(msg);

  // timestamp
  if (entry.at)
    throw "reported metrics may not have an `at` property, that's reserved";
  entry.at = new Date().toUTCString();

  // only coarse UA strings can be sent to the backend.
  if (entry.browser)
    entry.user_agent = coarse.parse(entry.browser);

  return entry;
};




#!/usr/bin/env node
const sortObjectsArray = require('sort-objects-array');


exports.orderCommits = function (commitObjects, order, property) {

  property = property.trim();

  if (property.indexOf("%_") === 0) {
    property = property.substr(2, property.length)
  }

  return sortObjectsArray(commitObjects, property, {order: order.toLowerCase(), caseinsensitive: true});
};

#!/usr/bin/env node

exports.orderCommits = function (commitObjects, order, property) {

  property = property.trim();

  if (property.indexOf("%_") === 0) {
    property = property.substr(2, property.length)
  }

  if (order.toUpperCase() === "ASC") {
    commitObjects.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
  } else {
    commitObjects.sort((a, b) => (a[property] > b[property]) ? -1 : 1);
  }

  return commitObjects;
};

'use strict';

let Mockdata = require('./mockdata')

class Prefs {
  static getFilter() {
    let destFilter = Mockdata.destinations().reduce((o, dest) => {
      o[dest] = true
      return o
    }, {})
    return { budgetAbove: 30, destinations: destFilter }
  }
}

module.exports = Prefs

'use strict';

let Mockdata = require('./mockdata')

class ServerApi {
  static getDestinations(callback) {
    callback(Mockdata.destinations())
  }

  static getDeliveryRequests(filter, callback) {
    let requests = this.applyFilter(filter, Mockdata.deliveryRequests())
    callback(requests)
  }

  static applyFilter(filter, deliveryRequests) {
    //TODO implement filter
    return deliveryRequests
  }
}

module.exports = ServerApi

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
    return deliveryRequests.filter((dr) => {
      let result = true;
      if (filter && filter.destinations) {
        let ds = []
        for (let d in filter.destinations) {
          if (filter.destinations[d]) {
            ds.push(d);
          }
        }
        result = result && ds.includes(dr.destination);
      }
      if (filter && filter.budgetAbove) {
        result = result && (filter.budgetAbove === 0 || dr.budget >= filter.budgetAbove)
      }
      return result;
    })
  }
}

module.exports = ServerApi

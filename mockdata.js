'use strict';

class Mockdata {
  static deliveryRequests() {
    let deliveryRequests = [
      {
        coordinates: [48.470720, -123.326226],
        type: 'flower',
        budget: 10,
        destination: 'Victoria',
      },
      {
        coordinates: [48.467590, -123.322750],
        type: 'restaurant',
        budget: 10,
        destination: 'Victoria',
      },
      {
        coordinates: [48.466565, -123.323694],
        type: 'restaurant',
        budget: 10,
        destination: 'Victoria',
      },
      {
        coordinates: [48.470634, -123.314596],
        type: 'restaurant',
        budget: 10,
        destination: 'Victoria',
      },
      {
        coordinates: [48.467078, -123.316184],
        type: 'flower',
        budget: 10,
        destination: 'View Royal',
      },
      {
        coordinates: [48.468529, -123.313051],
        type: 'restaurant',
        budget: 10,
        destination: 'View Royal',
      },
      {
        coordinates: [48.466935, -123.309274],
        type: 'restaurant',
        budget: 10,
        destination: 'View Royal',
      },
      {
        coordinates: [48.464630, -123.318587],
        type: 'furniture',
        budget: 10,
        destination: 'Saanich',
      },
      {
        coordinates: [48.478202, -123.315111],
        type: 'flower',
        budget: 10,
        destination: 'Saanich',
      },
      {
        coordinates: [48.475585, -123.331075],
        type: 'furniture',
        budget: 10,
        destination: 'Saanich',
      },
      {
        coordinates: [48.475329, -123.337255],
        type: 'restaurant',
        budget: 10,
        destination: 'Landford',
      },
      {
        coordinates: [48.467590, -123.328329],
        type: 'restaurant',
        budget: 10,
        destination: 'Landford',
      },
      {
        coordinates: [48.471033, -123.298674],
        type: 'restaurant',
        budget: 10,
        destination: 'Landford',
      },
    ]
    return deliveryRequests.map((o, idx) => { o.id = idx; return o; })
  }

  static destinations() {
    return ['Victoria', 'Landford', 'View Royal', 'Saanich']
  }
}

module.exports = Mockdata

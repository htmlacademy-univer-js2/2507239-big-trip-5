import {getRandomInteger} from '../utils.js';

const TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const DESTINATIONS = [
  {
    id: 1,
    description: 'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva).',
    name: 'Geneva',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 100)}`,
        description: 'Geneva parliament building'
      }
    ]
  },
  {
    id: 2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    name: 'Amsterdam',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 100)}`,
        description: 'Amsterdam canal'
      }
    ]
  }
];

const OFFERS_BY_TYPE = {
  'taxi': [
    {
      id: 1,
      title: 'Order Uber',
      price: 20
    },
    {
      id: 2,
      title: 'Choose radio station',
      price: 5
    }
  ],
  'flight': [
    {
      id: 3,
      title: 'Add luggage',
      price: 50
    },
    {
      id: 4,
      title: 'Switch to comfort',
      price: 80
    }
  ]
};

const generatePoint = () => {
  const type = TYPES[getRandomInteger(0, TYPES.length - 1)];
  const availableOffers = OFFERS_BY_TYPE[type] || [];

  return {
    basePrice: getRandomInteger(20, 1000),
    dateFrom: new Date('2023-10-20T10:00:00.000Z').toISOString(),
    dateTo: new Date('2023-10-21T12:00:00.000Z').toISOString(),
    destination: DESTINATIONS[getRandomInteger(0, DESTINATIONS.length - 1)].id,
    id: getRandomInteger(1, 100),
    isFavorite: Boolean(getRandomInteger(0, 1)),
    offers: availableOffers.length ?
      [availableOffers[getRandomInteger(0, availableOffers.length - 1)].id] : [],
    type
  };
};

const generateMockRoutePoints = (count) =>
  Array.from({length: count}, generatePoint);

export {generatePoint, DESTINATIONS, OFFERS_BY_TYPE, TYPES, generateMockRoutePoints};

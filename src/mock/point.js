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

let nextPointId = 0;
const getUniqueId = () => nextPointId++;

const generatePoint = () => {
  const type = TYPES[getRandomInteger(0, TYPES.length - 1)];
  const availableOffers = OFFERS_BY_TYPE[type] || [];

  const now = new Date();
  const dayOffsetType = getRandomInteger(-1, 1);

  const dateFrom = new Date(now);
  let dateTo = new Date(now);

  const hourOffsetFrom = getRandomInteger(8, 18);
  const minuteOffsetFrom = getRandomInteger(0, 59);
  const durationHours = getRandomInteger(1, 5);
  const durationMinutes = getRandomInteger(0, 59);

  if (dayOffsetType === -1) {
    const pastDayOffset = getRandomInteger(1, 10);
    dateFrom.setDate(now.getDate() - pastDayOffset);
    dateFrom.setUTCHours(hourOffsetFrom, minuteOffsetFrom, 0, 0);
    dateTo = new Date(dateFrom);
    dateTo.setUTCHours(dateFrom.getUTCHours() + durationHours, dateFrom.getUTCMinutes() + durationMinutes, 0, 0);
  } else if (dayOffsetType === 0) {
    const presentOffsetSign = getRandomInteger(0, 1) === 0 ? -1 : 1;
    dateFrom.setUTCHours(now.getUTCHours() + (presentOffsetSign * getRandomInteger(0, 2)), minuteOffsetFrom, 0, 0);
    dateTo = new Date(dateFrom);
    dateTo.setUTCHours(dateFrom.getUTCHours() + durationHours, dateFrom.getUTCMinutes() + durationMinutes, 0, 0);
  } else {
    const futureDayOffset = getRandomInteger(1, 10);
    dateFrom.setDate(now.getDate() + futureDayOffset);
    dateFrom.setUTCHours(hourOffsetFrom, minuteOffsetFrom, 0, 0);
    dateTo = new Date(dateFrom);
    dateTo.setUTCHours(dateFrom.getUTCHours() + durationHours, dateFrom.getUTCMinutes() + durationMinutes, 0, 0);
  }

  return {
    basePrice: getRandomInteger(20, 1000),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: DESTINATIONS[getRandomInteger(0, DESTINATIONS.length - 1)].id,
    id: getUniqueId(),
    isFavorite: Boolean(getRandomInteger(0, 1)),
    offers: availableOffers.length ?
      [availableOffers[getRandomInteger(0, availableOffers.length - 1)].id] : [],
    type
  };
};

const generateMockRoutePoints = (count) => {
  nextPointId = 0;
  return Array.from({length: count}, generatePoint);
};

export {generatePoint, DESTINATIONS, OFFERS_BY_TYPE, TYPES, generateMockRoutePoints};

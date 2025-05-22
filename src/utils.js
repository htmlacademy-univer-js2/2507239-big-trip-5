const sortPointsByDay = (pointA, pointB) => {
  if (pointA.dateFrom === null && pointB.dateFrom === null) {
    return 0;
  }
  if (pointA.dateFrom === null) {
    return 1;
  }
  if (pointB.dateFrom === null) {
    return -1;
  }

  const dateA = new Date(pointA.dateFrom).getTime();
  const dateB = new Date(pointB.dateFrom).getTime();
  return dateA - dateB;
};

const sortPointsByTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo).getTime() - new Date(pointA.dateFrom).getTime();
  const durationB = new Date(pointB.dateTo).getTime() - new Date(pointB.dateFrom).getTime();
  return durationB - durationA;
};

const sortPointsByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const getRandomInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export {
  getRandomInteger,
  sortPointsByDay,
  sortPointsByTime,
  sortPointsByPrice
};

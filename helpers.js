import { toast } from 'react-toastify';
import { EMAIL_REGEXP, currentRole } from './consts';

const getLinkType = (val) => {
  const linkTypes = {
    general: { title: 'Лот', roleId: [43] },
    shipping: { title: 'Транспорт', roleId: [46] },
    finance: { title: 'Финансы', roleId: [49, 50] },
    document: { title: 'Документы', roleId: [53] },
    payment: { title: 'Платежи', roleId: [56] },
  };

  return linkTypes[val] || {};
};
const controlNumber = (item) => {
  const allowedChars = /[0-9-.]/;
  const value = item.replace(',', '.');

  if (!value) return '';

  const lastChar = value[value.length - 1];
  if (!allowedChars.test(lastChar)) {
    return value.slice(0, -1);
  }

  if (lastChar === '.') {
    const countPoints = value.split('.').length - 1;
    if (countPoints > 1) {
      return value.slice(0, -1);
    }
  } else if (lastChar === '-') {
    if (value[0] !== '-' || value.indexOf('-', 1) !== -1) {
      return value.slice(0, -1);
    }
  } else if (value.includes('.')) {
    const decimalPart = value.split('.')[1];
    if (decimalPart.length > 2) {
      return value.slice(0, -1);
    }
  }

  return value;
};

const valuePosition = (val, pathCurrent) => {
  let res;
  const boll = pathCurrent === '/removedTransport' || pathCurrent === '/archiveTransport' ? 165 : 140;
  if (val) {
    res = val * 45.5 + boll;
  } else {
    res = 190;
  }
  return res;
};
// Расчет цены за контейнер
const dataResultPriseContainer = (prise) => {
  const paymentInformation = prise.paymentInformation;
  if (paymentInformation.length === 0) return 'Уточняется';

  const filterPayment_by = paymentInformation.filter((el) => el.payment_by === 1);
  if (filterPayment_by.length === 0) return 'Уточняется';

  let res = filterPayment_by.reduce((acc, el) => acc + el.confirm_price, 0);

  const agPrice = prise.financeInformation && prise.financeInformation.ag_price;
  return Math.round(res - (agPrice || 0));
};

const getDestinationsFunc = (val, klaipedaArray) => {
  const find = val.filter((elem) => klaipedaArray.id === elem.destination_id);

  return find.length > 0 ? find[0].date.split('-').reverse().join('-') : '';
};

const statusValue = (pathCurrent) => {
  let res;
  if (pathCurrent === '/archiveTransport') res = [5];
  else if (pathCurrent === '/auctions-transportsNotAll') res = [1];
  else if (pathCurrent === '/auctions-inSale') res = [4];
  else res = [2, 3, 4];
  return res;
};

const getDateFunc = (val) => {
  return val ? new Date(val).toISOString().split('T')[0] : '';
};

// Расчет цены за лот
const dataResultPriseLot = (prise) =>
  prise.paymentInformation.reduce((acc, elem) => {
    if (+elem.payment_by === 0) {
      acc += elem.confirm_price || 0;
    }
    return acc;
  }, 0) - (prise.price || 0);

const controlWidth = (expanded, openKeys) => {
  if (!expanded) return 0;

  const widthMap = {
    5: 310,
    '5-1': 410,
    '8-1': 450,
    8: 310,
    7: 310,
    6: 310,
  };

  let width = 210;
  openKeys.forEach((key) => {
    if (widthMap[key] && widthMap[key] > width) {
      width = widthMap[key];
    }
  });

  return width;
};

const viewPorts = (val) => (val && val.length > 0 ? val.map(({ name }) => name).join(', ') : '-');

const viewDestinations = (val) => (val && val.length > 0 ? val.map(({ title }) => title).join(', ') : '-');

const dataView = (place_destination, destination) => {
  const place = place_destination && place_destination.title;
  const port = destination && destination.title;

  return place && port ? `порт: ${port}, место: ${place}` : place || port ? `${place || port}` : '-';
};
const dataViewInland = (place_destination, destination) => {
  const place = place_destination && place_destination;
  const port = destination && destination;

  return place && port ? `${port} - ${place}` : place || port ? `${place || port}` : '-';
};

const connect = (val) => (val.length > 0 ? val.map(({ id }) => id).join(',') : '-');

const connectTitle = (val) => (val.length > 0 ? [...new Set(val.map(({ destination: { title } }) => title))].join(',') : '-');
const controlCheck = (pdpSelectDefault, pdpSelect) => {
  const longer = pdpSelectDefault.length > pdpSelect.length ? pdpSelectDefault : pdpSelect;
  const shorter = pdpSelectDefault.length > pdpSelect.length ? pdpSelect : pdpSelectDefault;
  const findRes = longer.filter((item) => !shorter.includes(item));
  return findRes.length > 0 ? { status: longer.length > shorter.length, value: findRes } : [];
};

const controlIdDestination = (dataCarters) =>
  dataCarters.length > 0 ? dataCarters[0].destinationPlaceDestinations.map(({ destination_id }) => destination_id) : [];

const createNotification = (message, type = 'info') => {
  const options = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };
  toast[type](message, options);
};

const getPrise = ({ obj, val }) => `${obj && obj[val] ? Math.round(+obj[val]) : '0'}$`;

const clickToLink = (val) => {
  const paths = {
    CashAccountAgent: '/listOfAgentEdit/',
    CashAccountCarter: '/carterProfile/',
    cashAccountPartner: '/agentProfile/',
  };
  const path = paths[Object.keys(val).find((key) => paths?.[key])];
  return path ? `${path}${val.id}` : null;
};
const getAllData = (...arrays) => [].concat(...arrays);

const partsLimit = (val) =>
  val.map((item) => ({
    label: item,
    value: item,
  }));

const dataAutoInfo = ({ val, data, title }) =>
  val.length > 0
    ? val
        .map((val) => val[title])
        .filter((id) => data.some(({ id: dId }) => dId === id))
        .map((id) => data.find(({ id: dId }) => dId === id).name)
        .join(', ')
    : '';

const isEmailValid = (value) => EMAIL_REGEXP.test(value);

const validRole = (role) => role?.includes(currentRole);

const IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getFormDate = (val) => val?.date?.toISOString().slice(0, 10) ?? null;

export {
  getLinkType,
  controlNumber,
  valuePosition,
  dataResultPriseContainer,
  getDestinationsFunc,
  statusValue,
  getDateFunc,
  dataResultPriseLot,
  controlWidth,
  viewPorts,
  dataView,
  connect,
  controlCheck,
  dataViewInland,
  createNotification,
  viewDestinations,
  connectTitle,
  controlIdDestination,
  getPrise,
  clickToLink,
  getAllData,
  partsLimit,
  dataAutoInfo,
  isEmailValid,
  validRole,
  IsJsonString,
  getFormDate,
};

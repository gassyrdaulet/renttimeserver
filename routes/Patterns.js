export const namePattern =
  /^[a-zA-Zа-яА-Я0-9\sӘәІіҢңҒғҮүҰұҚқӨөҺһЁё_\-/+.,()*'-]+$/;
export const textPattern = /^[a-zA-Zа-яА-Я0-9\sӘәІіҢңҒғҮүҰұҚқӨөҺһЁё]+$/;
export const addressPattern =
  /^[a-zA-Zа-яА-Я0-9\sӘәІіҢңҒғҮүҰұҚқӨөҺһЁё_\-/+.,()*'-]+$/;
export const numericPattern = /^\d+$/;

export const isCISPhoneNumber = (value) => {
  // Регулярное выражение для проверки формата номера телефона Казахстана
  const CISPhoneRegex =
    /^((8|\+374|\+994|\+995|\+375|\+7|\+380|\+38|\+996|\+998|\+993)[\- ]?)?\(?\d{3,5}\)?[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}(([\- ]?\d{1})?[\- ]?\d{1})?$/;
  return CISPhoneRegex.test(value);
};

export const parseObjectInt = (keys, obj) => {
  try {
    keys.forEach((key) => (obj[key] = parseInt(obj[key])));
  } catch (e) {
    throw new Error("Error parsing object to Integer");
  }
};

export const trimObject = (keys, obj) => {
  try {
    keys.forEach((key) => (obj[key] = obj?.[key]?.trim()));
  } catch (e) {
    throw new Error("Error trimming the object");
  }
};

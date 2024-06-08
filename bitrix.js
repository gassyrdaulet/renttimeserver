import bitrix from "./bitrix.json" assert { type: "json" };
import fetch from "node-fetch";

const { url } = bitrix;

export const publishDeal = async (days, data, priceId, productId) => {
  const addContact = await fetch(url + "crm.contact.add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        NAME: data.name,
        PHONE: [{ VALUE: data.phone, VALUE_TYPE: "MOBILE" }],
      },
    }),
  });
  const contact = await addContact.json();
  const { result: contactId } = contact;
  if (!addContact.ok) {
    const error = new Error("Ошибка при попытке создания контакта в Битрикс");
    throw error;
  }
  const getPrice = await fetch(url + "catalog.price.get?id=" + priceId, {
    method: "GET",
  });
  const { result } = await getPrice.json();
  const { price: PRICE } = result.price;
  if (!getPrice.ok) {
    const error = new Error(
      "Ошибка при попытке выгрузки цены товаров из Битрикс"
    );
    throw error;
  }
  const fields = {
    fields: {
      STAGE_ID: "EXECUTING",
      UF_CRM_1716125097863: days,
      CONTACT_ID: contactId,
    },
    params: { REGISTER_SONET_EVENT: "Y" },
  };
  const addDeal = await fetch(url + "crm.deal.add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!addDeal.ok) {
    const error = new Error("Ошибка при попытке выгрузки сделки в Битрикс");
    throw error;
  }

  const { result: newId } = await addDeal.json();
  const rows = {
    id: newId,
    rows: [{ PRODUCT_ID: productId, PRICE }],
  };
  const addProduct = await fetch(url + "crm.deal.productrows.set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rows),
  });

  if (!addProduct.ok) {
    const error = new Error(
      "Ошибка при попытке изменить товары сделки в Битрикс"
    );
    throw error;
  }
};

// const getPrices = async () => {
//   try {
//     const res = await fetch(url + "catalog.price.list", {
//       method: "GET",
//     });
//     const { result } = await res.json();
//     console.log(result.prices);
//   } catch (e) {
//     console.log("Ошибка при получении цен с Битрикс:", e.message);
//   }
// };

// getPrices();

// const getPrice = async (productId) => {
//   try {
//     const res = await fetch(url + "catalog.price.get?id=" + productId, {
//       method: "GET",
//     });
//     const { result } = await res.json();
//     console.log(result);
//   } catch (e) {
//     console.log("Ошибка при получении цен с Битрикс:", e.message);
//   }
// };

// getPrice(9);

import config from "../config/config.json" assert { type: "json" };
import axios from "axios";

const { SMS_API_KEY, SMS_API_HOST } = config;

const SMSAxios = axios.create({
  baseURL: SMS_API_HOST,
  timeout: 10000,
  params: {
    apiKey: SMS_API_KEY,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendMessage(number, text) {
  const cleaned = number.replace(/[^0-9]/g, "");
  const formatted = `7${cleaned.slice(1, 11)}`;
  const response = await SMSAxios.post("message/SendSMSMessage", {
    recipient: formatted,
    text,
  });
  if (!response?.data) {
    throw new Error("SMS is not available at the moment");
  }
  if (response.data.code !== 0) {
    throw new Error("Invalid cellphone number");
  }
  return response.data.data.messageId;
}

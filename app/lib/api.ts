import axios from "axios";
import { backend_url } from "../config";
import { taxCategory } from "../models";

export const getTaxRates = async (): Promise<taxCategory[]> => {
  console.log("starting");
  const resp = await axios.get(backend_url + "taxrates");
  return resp.data;
};

export const setTaxRates = async (data: taxCategory[]) => {
  console.log("POST " + JSON.stringify(data))
  await axios.post(backend_url + "taxrates", data);
};

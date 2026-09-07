import axios from "axios";
import { backend_url } from "../config";
import { taxCategory, taxDocumentStatus } from "../models";

export const getTaxRates = async (): Promise<taxCategory[]> => {
  const resp = await axios.get(backend_url + "taxrates");
  return resp.data;
};

export const setTaxRates = async (data: taxCategory[]) => {
  console.log("POST " + JSON.stringify(data))
  await axios.post(backend_url + "taxrates", data);
};


export const getTaxDocumentStatus = async (): Promise<taxDocumentStatus> => {
  const resp = await axios.get(backend_url + "taxdocuments");
  return resp.data;
}

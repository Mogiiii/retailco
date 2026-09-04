import { backend_url } from "../config";
import { taxCategory } from "../models";

export const getTaxRates = (): taxCategory[] => {
  fetch(backend_url + "taxrates")
    .then((response) => {
      response
        .json()
        .then((r: { id: string; taxrate: string; category: string }[]) => {
          return r.map((d) => { 
          });
        });
    })
    .catch((e) => console.timeLog(e));
  return [];
};

export const setTaxRates = (data: taxCategory[]) => {
  fetch(backend_url + "taxrates", {
    method: "POST",
    body: JSON.stringify(data),
  }).catch((e) => console.timeLog(e));
};

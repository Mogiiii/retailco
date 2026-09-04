import { backend_url } from "../config";
import { taxCategory } from "../models";

export const getTaxRates = (): taxCategory[] => {
  let sampleData = [
    {
      id: 1,
      category: "test",
      taxrate: 0.1,
    },
  ];
  fetch(backend_url + "taxrates")
    .then((response) => {
      response
        .json()
        .then((data) => {
          return data;
        })
        .catch((e) => console.timeLog(e));
    })
    .catch((e) => console.timeLog(e));

  //fallback
  return sampleData;
};

export const setTaxRates = (data: taxCategory[]) => {
  fetch(backend_url + "taxrates", {
    method: "POST",
    body: JSON.stringify(data),
  }).catch((e) => console.timeLog(e));
};

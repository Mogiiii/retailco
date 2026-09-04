"use client";

import { useState } from "react";
import { taxCategory } from "../../models";
import { setTaxRates } from "../../lib/api";

const CreateComponent = () => {
  const [id, setId] = useState(0);
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState(0);

  const handleSubmit = () => {
    const newCategory: taxCategory = {
      id: id,
      category: category,
      taxrate: rate,
    };
    setTaxRates([newCategory]);
  };

  return (
    <>
      Create or update tax category
      <form onSubmit={handleSubmit}>
        id:
        <input
          type="number"
          value={id}
          onChange={(e) => setId(Number.parseInt(e.target.value))}
        ></input>
        <br></br>
        category:
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        ></input>
        <br></br>
        tax rate:
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(Number.parseFloat(e.target.value))}
        ></input>
      </form>
    </>
  );
};

const CsvComponent = () => {
  const [file, setFile] = useState<File | null>();
  const handleSubmit = () => {
    if (file) {
    }
  };

  return (
    <>
      Upload CSV
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0])}
        ></input>
        <button>submit</button>
      </form>
    </>
  );
};

const page = () => {
  return (
    <>
      <CreateComponent></CreateComponent>
      <CsvComponent />
    </>
  );
};
export default page;

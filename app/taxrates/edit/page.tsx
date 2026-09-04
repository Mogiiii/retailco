"use client";


import { useState } from "react";
import { taxCategory } from "../../models";
import { setTaxRates } from "../../lib/api";
import Link from "next/link";

const CreateComponent = () => {
  const [id, setId] = useState(0);
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState(0);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    const newCategory: taxCategory = {
      id: id,
      category: category,
      taxrate: rate,
    };
    await setTaxRates([newCategory]);
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
        <br></br>
        <button>submit</button>
      </form>
    </>
  );
};
const page = () => {
  return (
    <>
      <Link href={"/taxrates"}>Back to tax rates</Link> <br></br>
      <CreateComponent></CreateComponent>
    </>
  );
};
export default page;

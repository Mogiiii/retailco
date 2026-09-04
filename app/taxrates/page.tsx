"use client";
import { taxCategory } from "../models";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTaxRates } from "../lib/api";

const TableDisplay = ({ data }: { data: taxCategory[] | undefined }) => {
  if (data) {
    return (
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Tax Rate(%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.category}</td>
              <td>{r.taxrate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return <>loading data</>;
  }
};

export default function Page() {
  const [rates, setRates] = useState<taxCategory[] | undefined>();
  useEffect(() => {
    console.log("loading");
    getTaxRates().then((r) => {
      setRates(r);
      console.log("loaded " + r);
    });
  }, []);

  return (
    <>
      <Link href="/taxrates/edit">edit tax rates</Link>
      <br></br>
      <TableDisplay data={rates} />
    </>
  );
}

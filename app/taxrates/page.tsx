"use client";
import { taxCategory } from "../models";
import { backend_url } from "../config";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTaxRates } from "../lib/api";

const TableDisplay = ({ data }: { data: taxCategory[] }) => {
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
};

const page = () => {
  let rates = getTaxRates();

  return (
    <>
      <Link href="/taxrates/edit">edit tax rates</Link>
      <TableDisplay data={rates} />
    </>
  );
};

export default page;

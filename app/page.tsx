"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { backend_url } from "./config";
import { taxCategory, taxDocumentStatus, taxSummary } from "./models";
import { getTaxRates } from "./lib/api";

const TaxSummary = ({
  taxCategories,
  data,
}: {
  taxCategories: taxCategory[] | undefined;
  data: taxSummary | undefined;
}) => {
  if (taxCategories && data) {
    const processed_data = data.tax_items.map((item) => {
      const category = taxCategories.find(
        (tc) => tc.id == item.tax_category,
      ) ?? { category: "error", id: 0, taxrate: 0 };
      return {
        description: item.description,
        category: category.category,
        taxRate: category.taxrate,
        pretaxAmount: item.pretax_amount,
        taxAmount: item.pretax_amount * category.taxrate,
      };
    });

    return (
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Tax Rate(%)</th>
            <th>pre tax amount</th>
            <th>tax amount</th>
          </tr>
        </thead>
        <tbody>
          {processed_data.map((d) => (
            <tr key={d.description}>
              <td>{d.description}</td>
              <td>{d.category}</td>
              <td>{d.taxRate}</td>
              <td>{d.pretaxAmount}</td>
              <td>{d.taxAmount}</td>
            </tr>
          ))}
          <tr key="total">
            <td>Total</td>
            <td></td>
            <td></td>
            <td>
              {processed_data
                .map((d) => d.pretaxAmount)
                .reduce((total, v) => total + v, 0)}
            </td>
            <td>
              {processed_data
                .map((d) => d.taxAmount)
                .reduce((total, v) => total + v, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    );
  } else <></>;
};

const TaxDocumentsSection = ({
  taxCategories,
  data,
}: {
  taxCategories: taxCategory[] | undefined;
  data: taxDocumentStatus[] | undefined;
}) => {
  return (
    <div>
      {data?.map((d) => {
        function Detail() {
          if (d.data) {
            return (
              <details>
                <summary>detials</summary>
                <TaxSummary
                  taxCategories={taxCategories}
                  data={d.data}
                ></TaxSummary>
              </details>
            );
          }
          return <></>;
        }
        return (
          <>
            {d.createdAt} {d.id}
            <Detail></Detail>
          </>
        );
      })}
    </div>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<taxDocumentStatus[] | undefined>();
  const [taxCategories, setTaxCategories] = useState<
    taxCategory[] | undefined
  >();

  useEffect(() => {
    getTaxRates().then((r) => {
      setTaxCategories(r);
    });
  }, []);

  const fileUploadSubmitHandler = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (file) {
      axios
        .post(backend_url + "createdocument", {
          filename: file.name,
          content_type: file.type,
        })
        .then((r) => {
          console.log("uploading to " + r.data.uploadUrl);
          axios
            .put(r.data.uploadUrl, file, {
              headers: {
                "Content-Type": file.type,
              },
            })
            .then(() => {
              alert("Document successfully uploaded");
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  return (
    <>
      <Link href="/taxrates">view current tax rates</Link>

      <form onSubmit={fileUploadSubmitHandler}>
        Let agent calculate tax rates:{" "}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        ></input>
        <button>Submit</button>
      </form>
      <TaxDocumentsSection
        data={documents}
        taxCategories={taxCategories}
      ></TaxDocumentsSection>
    </>
  );
}

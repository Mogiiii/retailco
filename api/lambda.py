import base64
import json
import os
import uuid
from datetime import datetime
from decimal import Decimal

import boto3
import filetype
from openai import OpenAI
from pydantic import BaseModel
from types_boto3_dynamodb.service_resource import Table


class tax_line_item(BaseModel):
    description: str
    pretax_amount: float
    tax_category: int


class tax_summary(BaseModel):
    tax_items: list[tax_line_item]


class taxrateentry(BaseModel):
    id: int
    category: str
    taxrate: Decimal


dynamodb = boto3.resource("dynamodb")
tax_rates_table: Table = dynamodb.Table("retailco-taxrates")
tax_document_table: Table = dynamodb.Table("retailco-taxdocuments")


def Ok(body):
    def serializer(o):
        if isinstance(o, Decimal):
            if o % 1 == 0:
                return int(o)
            return float(o)
        else:
            return str(o)

    return {"statusCode": 200, "body": json.dumps(body, default=serializer)}


def get_all_tax(event, context):
    # TODO handle pagination
    result = tax_rates_table.scan()
    return Ok(result.get("Items", []))


# upsert => create or update
def upsert_tax(event, context):
    to_add: list[taxrateentry] = [
        taxrateentry.model_validate(x) for x in json.loads(event["body"])
    ]
    with tax_rates_table.batch_writer() as br:
        for entry in to_add:
            i = {"id": entry.id, "category": entry.category, "taxrate": entry.taxrate}
            _ = br.put_item(Item=i)
    return Ok("OK")


def get_documents(event, context):
    # TODO handle pagination
    result = tax_document_table.scan()
    return Ok(result.get("Items", []))


def request_upload_url(event, context):
    s3_client = boto3.client("s3")
    body = json.loads(event["body"])
    file_name = body["filename"]
    content_type = body["content_type"]

    id = str(uuid.uuid4())
    upload_location = f"documents/{id}/{file_name}"

    i = {
        "id": id,
        "status": "awaiting_upload",
        "s3_location": upload_location,
        "createdAt": datetime.now(),
        "content_type": content_type,
    }
    tax_document_table.put_item(Item=i)

    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": "retailco-documents",
            "Key": upload_location,
            "ContentType": content_type,
        },
        ExpiresIn=600,
    )

    return {
        "statusCode": 202,
        "body": json.dumps(
            {"id": id, "uploadUrl": upload_url, "s3_upload_location": upload_location}
        ),
    }


def process_document(event, context):
    s3_client = boto3.client("s3")

    record = event["Records"][0]
    bucket = record["s3"]["bucket"]["name"]
    key = record["s3"]["object"]["key"]
    id = key.split("/")[1]

    response = s3_client.get_object(Bucket=bucket, Key=key)

    file_data = response["Body"].read()

    print("bucket:" + bucket)
    print("key:" + key)
    print("id:" + id)

    table_data = tax_document_table.get_item(Key={"id": id})
    content_type = table_data["Item"]["content_type"]
    print(json.dumps(table_data))

    openapi_api_key = os.environ["OPENAI_API_KEY"]
    client = OpenAI(api_key=openapi_api_key)

    file_content = f"data:{content_type};base64,{file_data}"
    # TODO pagination
    tax_categories = tax_rates_table.scan()
    try:
        response = client.responses.parse(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "filename": "document",
                            "file_data": file_content,
                        },
                        {
                            "type": "input_text",
                            "text": "Analyze the file and assign tax categories according to the following data:\n"
                            + json.dumps(tax_categories),
                        },
                    ],
                }
            ],
            text_format=tax_summary,
        )

        i = {
            "id": id,
            "status": "complete",
            "data": response,
            "createdAt": table_data["Item"]["createdAt"],
        }
        tax_document_table.put_item(Item=i)

    except Exception as e:
        i = {"id": id, "status": "failed", "data": [], "error": e}
        tax_document_table.put_item(Item=i)
        print(e)

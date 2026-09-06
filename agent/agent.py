import json
import os

import requests
from openai import OpenAI
from pydantic import BaseModel


class tax_line_item(BaseModel):
    description: str
    pretax_amount: float
    tax_category: int


class tax_summary(BaseModel):
    tax_items: list[tax_line_item]


openapi_api_key = os.environ["OPENAI_API_KEY"]
backend_api_url = "https://zxu7ck7dk4.execute-api.us-east-1.amazonaws.com/Prod/api/"
client = OpenAI(api_key=openapi_api_key)


def process_document(event, context):

    headers = event.get("headers")
    tax_categories = requests.get(backend_api_url + "taxrates").json()
    file_content = event["body"]
    content_type = headers.get("content-type")
    file_name = headers.get("x-file-name")
    file_data = f"data:{content_type};base64,{file_content}"

    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "filename": file_name,
                        "file_data": file_data,
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

    return {"statusCode": 200, "body": response}

import json
from decimal import Decimal

import boto3
from pydantic import BaseModel
from types_boto3_dynamodb.service_resource import Table


class taxrateentry(BaseModel):
    id: int
    category: int
    taxrate: Decimal


dynamodb = boto3.resource("dynamodb")
table: Table = dynamodb.Table("retailco-taxrates")


def Ok(body):
    return {"statusCode": 200, "body": json.dumps(body, default=str)}


def get_all(event, context):
    # TODO handle pagination
    result = table.scan()
    return Ok(result.get("Items", []))


# upsert => create or update
def upsert(event, context):
    to_add: list[taxrateentry] = [
        taxrateentry.model_validate(x) for x in json.loads(event["body"])
    ]
    with table.batch_writer() as br:
        for entry in to_add:
            i = {"id": entry.id, "Category": entry.category, "taxrate": entry.taxrate}
            _ = br.put_item(Item=i)
    return Ok("OK")

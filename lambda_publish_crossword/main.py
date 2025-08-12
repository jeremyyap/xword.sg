import boto3
import botocore
import json
import os
import logging
import datetime
import time
import urllib3
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.resource('s3')
cf = boto3.client('cloudfront')

TELEGRAM_BOT_TOKEN =os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID=os.environ.get("TELEGRAM_CHAT_ID")
CLOUDFRONT_DISTRIBUTION_ID = os.environ['CLOUDFRONT_DISTRIBUTION_ID']

def lambda_handler(event, context):
    logger.info("New files uploaded to the source bucket.")
        
    current_date = datetime.datetime.now()
    key = "crosswords/{}.json".format(current_date.strftime("%Y-%m-%d"))
    latest_key = "crosswords/latest.json"
        
    source_bucket = "queue.xword.sg"
    destination_bucket = "www.xword.sg"
    
    source = {'Bucket': source_bucket, 'Key': key}
        
    try:
        response = s3.meta.client.copy(source, destination_bucket, key)
        response = s3.meta.client.copy(source, destination_bucket, latest_key)
        logger.info("File copied to the destination bucket successfully!")

        response = cf.create_invalidation(
            DistributionId=CLOUDFRONT_DISTRIBUTION_ID,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ["/{}".format(latest_key)]
                },
                'CallerReference': str(time.time()).replace(".", "")
            }
        )
        logger.info("Successfully created invalidation {}".format(response['Invalidation']['Id']))

        date_str = current_date.strftime("%B %-d, %Y")
        http = urllib3.PoolManager()
        response = http.request("GET", f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", fields={
            'chat_id': TELEGRAM_CHAT_ID,
            'parse_mode': 'Markdown',
            'text': f"New XWord published: [{date_str}](https://xword.sg/?t={key})"
        })
        logger.info(response.data)

    except botocore.exceptions.ClientError as error:
        logger.error("There was an error copying the file to the destination bucket")
        print('Error Message: {}'.format(error))
        
    except botocore.exceptions.ParamValidationError as error:
        logger.error("Missing required parameters while calling the API.")
        print('Error Message: {}'.format(error))
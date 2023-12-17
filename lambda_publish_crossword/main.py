import boto3
import botocore
import json
import os
import logging
import datetime
import time
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.resource('s3')
cf = boto3.client('cloudfront')

def lambda_handler(event, context):
    logger.info("New files uploaded to the source bucket.")
        
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    key = "crosswords/{}.json".format(current_date)
    latest_key = "crosswords/latest.json"
        
    source_bucket = "queue.xword.sg"
    destination_bucket = "www.xword.sg"
    
    source = {'Bucket': source_bucket, 'Key': key}
    distribution_id = os.environ['CLOUDFRONT_DISTRIBUTION_ID']
        
    try:
        response = s3.meta.client.copy(source, destination_bucket, key)
        response = s3.meta.client.copy(source, destination_bucket, latest_key)
        logger.info("File copied to the destination bucket successfully!")

        response = cf.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ["/{}".format(latest_key)]
                },
                'CallerReference': str(time.time()).replace(".", "")
            }
        )
        logger.info("Successfully created invalidation {}".format(response['Invalidation']['Id']))

    except botocore.exceptions.ClientError as error:
        logger.error("There was an error copying the file to the destination bucket")
        print('Error Message: {}'.format(error))
        
    except botocore.exceptions.ParamValidationError as error:
        logger.error("Missing required parameters while calling the API.")
        print('Error Message: {}'.format(error))
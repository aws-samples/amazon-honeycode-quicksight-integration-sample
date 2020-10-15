// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Read survey results from Amazon Honeycode
 * Write survey results to Amazon S3
 */
const AWS = require('aws-sdk')
const HC = new AWS.Honeycode({ region: 'us-west-2' })
const S3 = new AWS.S3()
const { workbookId, appId, readScreenId, writeScreenId, screenAutomationId, s3bucket } = process.env

const getSurveyResults = nextToken => HC.getScreenData({
    workbookId, appId, screenId: readScreenId, nextToken
}).promise()

const updateSurveyResults = variables => HC.invokeScreenAutomation({
    workbookId, appId, screenId: writeScreenId, screenAutomationId, variables
}).promise()

const saveToS3 = Body => {
    //console.log('Writing to S3', Body)
    const now = new Date()
    //const Key = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}/${now.getTime()}.csv`
    const Key = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}/${now.getTime()}.json`
    return S3.putObject({ Body, Bucket: s3bucket, Key, ContentType: 'text/plain;charset=utf-8' }).promise()
}

const escape = str => str.indexOf && str.indexOf(',') !== -1 ? `"${str}"` : str

exports.handler = async () => {
    try {
        let nextToken
        const surveyResults = []
        const surveyRows = []
        let surveyHeaders
        do {
            //Read survey results
            const response = await getSurveyResults(nextToken)
            nextToken = response.nextToken
            if (surveyResults.length === 0) {
                //Include column headers
                //surveyResults.push(response.results["Survey List"].headers.map(header => escape(header.name)).join(','))
                surveyHeaders = response.results["Survey List"].headers.map(header => header.name)
            }
            for (let row of response.results["Survey List"].rows) {
                const { rowId, dataItems } = row
                surveyRows.push(rowId)
                //surveyResults.push(dataItems.map(item => escape(item.formattedValue)).join(','))
                surveyResults.push(dataItems.reduce((items, item, i) => {
                    items[surveyHeaders[i]] = item.overrideFormat === 'DATE_TIME' && item.formattedValue ? new Date(item.formattedValue).toISOString() : item.formattedValue
                    return items
                }, {}))
            }
        } while (nextToken)
        if (surveyResults.length > 1) {
            //Write survey result to S3
            //await saveToS3(surveyResults.join('\n'))
            await saveToS3(JSON.stringify(surveyResults, null, 2))
            //Update "In S3" column in survey results
            for (let rowId of surveyRows) {
                await updateSurveyResults({
                    Picklist: {
                        rawValue: rowId
                    }
                })
            }
        }
        const result = `Saved ${surveyResults.length} survey results to S3`
        console.log(result)
        return result
    } catch (error) {
        console.error(error)
        throw error
    }
}

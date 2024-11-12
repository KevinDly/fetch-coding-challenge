/*const express = require('express')
const bodyparser = require('body-parser')
const crypto = require('crypto')*/
import express from 'express'
import bodyparser from 'body-parser'
import crypto from 'crypto'

const app = express()

const receiptRouter = express.Router()
const processRouter = express.Router({ mergeParams: true })

const retailerRegex = new RegExp("^[\\w\\s\\-&]+$")
const totalRegex = new RegExp("^\\d+\\.\\d{2}$")
const descriptionRegex = new RegExp("^[\\w\\s\\-]+$")
const priceRegex = new RegExp("^\\d+\\.\\d{2}$")

const startingTime = 14
const endingTime = 16

const receiptInvalidMessage = "The receipt is invalid"
const idInvalidMessage = "No receipt found for that id."

receiptRouter.use(bodyparser.json())

let receiptStore = {}
receiptRouter.route('/process')
    .post((req, res) => {

        const receipt = req.body
        let points = 0

        //Verify that the required keys exist.
        let retailer = receipt['retailer']
        let purchaseDate = receipt['purchaseDate']
        let purchaseTime = receipt['purchaseTime']
        let items = receipt['items']
        let total = receipt['total']

        if(!retailer || !purchaseDate || !purchaseTime || !items || !total) {
            sendStatus(res, 400, receiptInvalidMessage)
            return
        }

        //Verify the data is well formed.
        if(!retailerRegex.test(retailer) || !totalRegex.test(total)) {
            sendStatus(res, 400, receiptInvalidMessage)
            return
        }

        let receiptDate = new Date(purchaseDate)

        //Validate the date is correct.
        if(!receiptDate.valueOf()) {
            sendStatus(res, 400, receiptInvalidMessage)
            return
        }

        const totalInt = parseInt(total * 100)

        //Give points for every alphanumeric in the Retailer's name.
        let alphanumericPoints = 0
        for(let i = 0; i < retailer.length; i++) {
            let char = retailer.charCodeAt(i)
            if((char > 47 && char < 58) ||
                (char > 64 && char < 91) ||
                (char > 96 && char < 123)) {
                    alphanumericPoints = alphanumericPoints + 1
                }
        }

        points = points + alphanumericPoints
        console.log(`Alphanumeric Points: ${alphanumericPoints}`)

        //Give points if the total is a round amount.
        if(totalInt % 100 === 0) {
            console.log("Round dollar no cents: 50")
            points = points + 50    
        }

        //Give points if the total is a multiple of .25.
        if(totalInt % 25 === 0) {
            console.log("Multiple of .25: 25")
            points = points + 25
        }

        //Give points for every 2 items.
        let everyTwoItemPoints = parseInt(items.length/2) * 5
        console.log(`Every 2 Item Points: ${everyTwoItemPoints}`)
        points = points + everyTwoItemPoints

        //Give points if the trimmed length of the description is a multiple of 3.
        let trimmedLengthPoints = 0
        for(const item of items) {

            let description = item['shortDescription']
            let price = item['price']

            if(!description || !price) {
                sendStatus(res, 400, receiptInvalidMessage)
                return
            }

            if(!descriptionRegex.test(description) || !priceRegex.test(price)) {
                sendStatus(res, 400, receiptInvalidMessage)
                return
            }

            description = description.trim()

            if(description.length % 3 === 0) {
                trimmedLengthPoints = trimmedLengthPoints + Math.ceil(parseFloat(price) * 0.2)
            }
        }
        console.log(`Trimmed Length mod 3 Points: ${trimmedLengthPoints}`)
        points = points + trimmedLengthPoints

        //Give points if the purchase date is odd.
        let purchaseDatePoints = (((receiptDate.getUTCDate()) % 2) == 0 ? 0 : 6)
        console.log(`Odd purchase date points: ${purchaseDatePoints}`)
        points = points + purchaseDatePoints

        //Give points if the time is between 2pm and 4pm.
        const hour = parseInt(purchaseTime.substring(0, 2))
        const minute = parseInt(purchaseTime.substring(3, 5))

        if(hour < endingTime && hour >= startingTime) {
            if(hour != startingTime || minute > 0) {
                console.log(`Between ${startingTime} and ${endingTime} Points: 10`)
                points = points + 10
            }
        }

        //Generate UUID and store points in memory.
        let uuid = crypto.randomUUID()

        receiptStore[uuid] = points
        console.log(`Final points: ${points}`)

        res.send({"id": uuid})
    })

receiptRouter.use('/:receiptID', processRouter)

processRouter.route('/points')
    .get((req, res) => {
        let receiptID = req.params['receiptID']
        let points = receiptStore[receiptID]

        //Validate ID exists.
        if(!points) {
            sendStatus(res, 404, idInvalidMessage)
            return
        }

        res.send({"points": points})
    })


app.use('/receipts', receiptRouter)

app.listen(3000, () => {
    console.log('Listening on port 3000.')
})

function sendStatus(res, code, message) {
    res.status(code).send(message)
}
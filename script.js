/**
 * Project : Artificial Intelligence
 * Created : 16 December 2019
 */

// http://ec2-100-24-5-45.compute-1.amazonaws.com:8080/api/days/3/16-12-2019_00:00:00 JOURNEE A PARTIR DE L'HEURE INDIQUEE
// http://ec2-100-24-5-45.compute-1.amazonaws.com:8080/api/hours/3/16-12-2019_00:00:00 POUR UNE HEURE DONNEE

import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'
import 'babel-polyfill'

const request = require('request')

async function runModel(mapData) {
    console.log(mapData)
}

async function run() {
    new Promise( (resolve, reject) => {
        let _timestamp = Date.now() - (86400000 * 30)
        let _mapData = new Map()

        for (let i = 0; i <= 23; i++) _mapData.set(i, new Array())

        request(`http://3.87.54.32:8081/api/daysAfter/3/${_timestamp}`, { json: true}, (err, res, body) => {
            body.forEach( (object) => {
                let _datetime = new Date(object.currentdate)
                _mapData.get(_datetime.getHours()).push(object.numberuser);
            })

            resolve(_mapData)
        })
    }).then((data) => {
        runModel(data)
    })
}

document.addEventListener('DOMContentLoaded', run)
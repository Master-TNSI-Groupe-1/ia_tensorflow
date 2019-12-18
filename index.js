/**
 * Project : Artificial Intelligence
 * Created : 16 December 2019
 */

// http://ec2-100-24-5-45.compute-1.amazonaws.com:8080/api/days/3/16-12-2019_00:00:00 JOURNEE A PARTIR DE L'HEURE INDIQUEE
// http://ec2-100-24-5-45.compute-1.amazonaws.com:8080/api/hours/3/16-12-2019_00:00:00 POUR UNE HEURE DONNEE

const tf = require('@tensorflow/tfjs-node')
const request = require('request')

class AI {
    constructor() {
        this.data = null

        this.getData()
    }

    getData() {
        let _subDay = 86400000
        let _timestamp = (Date.now() - _subDay)

        request(`http://3.87.54.32:8081/api/hours/3/${_timestamp}`, { json: true }, (err, res, body) => {
            switch (res.statusCode) {
                case 200:
                    if (body.length > 0) this.data = body
                    break
                default:
                    console.error("Server Error")
                    break
            }
            this.tensorFlow()
        })
    }

    tensorFlow() {
        const model = tf.sequential({
            layers: [tf.layers.dense({units: 1, inputShape: [10]})]
        });
        model.predict(tf.ones([8, 10]), {batchSize: 4}).print();
    }
}

async function runAI() {
    const ai = new AI()
}

runAI()
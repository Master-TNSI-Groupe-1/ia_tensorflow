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

    const values = mapData.map(d => ({
        x: d.hours,
        y: d.users,
      }));

    tfvis.render.scatterplot(
        {name: 'Test'},
        {values}, 
        {
          xLabel: 'Hours',
          yLabel: 'Users',
          height: 300
        }
    );

    const tensor = convertToTensor(mapData)
    console.log(tensor)
    const {hours, users} = tensor
    console.log(hours, users)

    const model = createModel()
    console.log("Model created")
    console.log(model)
    tfvis.show.modelSummary({name: 'Model Summary'}, model);

    await trainModel(model, hours, users)
    console.log("Done training")

    testModel(model, mapData, tensor);
}


function convertToTensor(data) {
    return tf.tidy(() => {
        tf.util.shuffle(data)
        
        const hours = data.map(d => d.hours)
        const users = data.map(d => d.users);
        
        const hoursTensor = tf.tensor2d(hours, [hours.length, 1])
        const usersTensor = tf.tensor2d(users, [users.length, 1])
        
        const hoursMax = hoursTensor.max()
        const hoursMin = hoursTensor.min()
        const usersMax = usersTensor.max()
        const usersMin = usersTensor.min()
    
        const normalizedHours = hoursTensor.sub(hoursMin).div(hoursMax.sub(hoursMin))
        const normalizedusers = usersTensor.sub(usersMin).div(usersMax.sub(usersMin))
    
        return {
            hours : normalizedHours,
            users : normalizedusers,
            hoursMax,
            hoursMin,
            usersMax,
            usersMin
        }
    });
}

function createModel() {
    const model = tf.sequential(); 
    
    model.add(tf.layers.dense({inputShape: [1], units: 40, useBias: true, activation: 'relu'}));
    // model.add(tf.layers.dense({units: 50, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 20, useBias: true, activation: 'relu'}));
    model.add(tf.layers.dense({units: 1, useBias: true, activation: 'relu'}));
  
    return model;
}

async function trainModel(model, hours, users) {
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
      });
      
      const batchSize = 72;
      const epochs = 200;
      
      return await model.fit(hours, users, {
        batchSize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks(
          { name: 'Training Performance' },
          ['loss', 'mse'], 
          { height: 200, callbacks: ['onEpochEnd'] }
        )
      });
}

async function testModel(model, inputData, normalizationData) {
    const {hoursMax, hoursMin, usersMin, usersMax} = normalizationData;  
    
    const [xs, preds] = tf.tidy(() => {
      
      const xs = tf.linspace(0, 1, 23);      
      const preds = model.predict(xs.reshape([23, 1]));      
      
      const unNormXs = xs
        .mul(hoursMax.sub(hoursMin))
        .add(hoursMin);
      
      const unNormPreds = preds
        .mul(usersMax.sub(usersMin))
        .add(usersMin);
      
      // Un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });
    
   
    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });
    
    const originalPoints = inputData.map(d => ({
      x: d.hours, y: d.users,
    }));
    
    
    tfvis.render.scatterplot(
      {name: 'Model Predictions vs Original Data'}, 
      {values: [originalPoints, predictedPoints], series: ['original', 'predicted']}, 
      {
        xLabel: 'hours',
        yLabel: 'users',
        height: 300
      }
    );
  }

async function run() {
    let _timestamp = Date.now() - (86400000 * 30)
    let _data = new Array()
    
    request(`http://3.87.54.32:8081/api/daysAfter/3/${_timestamp}`, { json: true}, (err, res, body) => {
        body.forEach( (object) => {
            let _map = {}
            let _datetime = new Date(object.currentdate)
            
            _map["hours"] = _datetime.getHours()
            _map["users"] = object.numberuser

            _data.push(_map)
        })

        runModel(_data)
    })
}

document.addEventListener('DOMContentLoaded', run)
const express = require('express');
const app = express();
const path = require('path')
const knex = require('./db/knex')
const cors = require('cors')
const axios = require('axios')
const key = require('./vision')

const port = process.env.PORT || 3033

app.use(express.static(path.join(__dirname, '../ui/build')))
// app.use(morgan('dev'));
app.use(cors());
app.use(express.json())

app.get('/companies', (req, res, next) => {
    knex('companies')
        .orderBy('name', 'desc')
        .then(companies => res.json({companies: companies}))
})

app.post('/companies', (req, res, next) => {
    knex('companies').insert(req.body).then(() => {
      knex('companies')
        .orderBy('name', 'desc')
        .then(companies => res.json(companies))
    })
  })

// app.post('/vision', (req, res, next) => {
//     console.log(req.body)
//     const road = `https://vision.googleapis.com/v1/images:annotate?key=${key}`
//     const picture = req.body.image
//     const payload = {
//         "requests":[
//           {
// 			"image":{
//         		"source":{
//                     "imageUri": picture
//                 }
//         	},
//             "features":[
//               {
//                 "type":"LOGO_DETECTION",
//                 "maxResults":1
//               }
//             ]
//           }
//         ]
//       }
    
//     axios.post(road, payload)
//         .then(response => {
//            const descriptions = response.data.responses[0].logoAnnotations.map(label => {
//                 return label.description
//             });
//             knex('companies').where('name', descriptions[0]).then(result => {
//                 console.log(result[0])
//                 res.json(result[0])
//             })
//                 })
//         .catch(error => {
//             console.log(error)
//         })
// })
  
  
  app.delete('/companies/:id', (req, res, next) => {
    knex('companies')
        .del()
            .where('id', req.params.id)
        .then(() => {
            knex('companies').orderBy('name', 'desc').then(companies => res.json(companies))
        })
    })
  
app.get('/', (req, res, next) => {
    const index = path.join(__dirname, '../client-logo/public/index.html')
    res.sendFile(index)
  })

  app.post('/vision', (req, res, next) => {
    const road = `https://vision.googleapis.com/v1/images:annotate?key=${key}`
    const picture = req.body.image.slice(23)
    const payload = {
        "requests":[
          {
			"image":{
        		"content":picture
        	},
            "features":[
              {
                "type":"LOGO_DETECTION",
                "maxResults":1
              },
              {
                "type":"TEXT_DETECTION",
                "maxResults":1
              },

              
            ]
          }
        ]
      }
    
    axios.post(road, payload)
        .then(response => {
        //    const descriptions = response.data.responses[0].logoAnnotations.map(label => {
        //         return label.description
        //     });
        //     knex('companies').where('name', descriptions[0]).then(result => {
        //         console.log(result[0])
        //         res.json(result[0])
        //     })

        const { inspect } = require('util')
        // console.log(inspect(response.data, false, null))
        let logoResponse = response.data.responses[0]
        let logoResults = null
        let searchTerm = null

        if(logoResponse.logoAnnotations){
            console.log('logo')
            logoResults = logoResponse.logoAnnotations
        } else {
            console.log('text')
            logoResults = logoResponse.textAnnotations
        }

        if(logoResponse.logoAnnotations){
             searchTerm = logoResponse.logoAnnotations[0].description;
            console.log(searchTerm)
        } else {
             searchTerm = logoResponse.textAnnotations[0].description;
            console.log(searchTerm)
        }

        res.json(searchTerm)


                })
        .catch(error => {
            console.log(error)
        })
})

app.listen( port, () => {
    console.log(`${port} is now active.`)
})
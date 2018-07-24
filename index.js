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
//GOOGLE VISION MAGIC
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

        const { inspect } = require('util')
        let logoResponse = response.data.responses[0]
        let logoResults = null
        let searchTerm = null
        let knexReply = []



        //IF LOGO IS RECOGNIZED
        if(logoResponse.logoAnnotations){
            console.log('logo')
            logoResults = logoResponse.logoAnnotations
            searchTermRaw = logoResponse.logoAnnotations[0].description;
            searchTerm = searchTermRaw.toLowerCase()
            console.log('searchTerm: ' + searchTerm)

        //IF TEXT IS RECOGNIZED
        } else {
            console.log('text')
            logoResults = logoResponse.textAnnotations
            searchTermRaw = logoResults === undefined? 'Not Found' : logoResponse.textAnnotations[0].description;
            searchTerm = searchTermRaw.toLowerCase().replace(/\s/g,'')
            console.log('searchTerm: ' + searchTerm)
        }

        //KNEX METHODS

        // knex.from('companies').leftJoin('alias', 'alias.company_id', 'companies.id')
        // .where('companies.label', 'like', `%${searchTerm}%`)
        // .orWhere('alias.label', 'like', `%${searchTerm}%`)
        // .then(result=> {
        //   const { inspect } = require('util')
        // console.log(inspect(result, false, null))
        //     res.json(result)
        // })


        knex('companies').where('label', searchTerm).then(result => {
        const { inspect } = require('util')

            if (!result.length){
                console.log(result)
                console.log('text not found, execute alias match')
                knex.from('companies').innerJoin('alias', 'alias.company_id', 'companies.id')
                .where('alias.label', searchTerm)
                .then(result1 => {
                    
                    if(!result1.length){
                        console.log('alias not found, execute partial match on '+ searchTerm)
                        knex.from('companies')
                        .leftJoin('alias', 'alias.company_id', 'companies.id')
                        .where('companies.label', 'like', `%${searchTerm}%`)
                        .orWhere('alias.label', 'like', `%${searchTerm}%`)
                        .then(result2 => {
                            console.log('PARTIAL LAYER 3')
                            knexReply = result2

                        })
                    }
                console.log('ALIAS LAYER 2')
                console.log('result 1 ' + inspect(result1, false, null))
                knexReply = result1
                console.log(inspect(knexReply, false, null))



                })
            }
            else{
                console.log('TEXT LAYER 1')
                console.log('text match found')
                knexReply = result
            }

            res.json(knexReply)
        })

                })
        .catch(error => {
            console.log(error)
        })
})

app.listen( port, () => {
    console.log(`${port} is now active.`)
})
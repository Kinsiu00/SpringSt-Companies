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


        //IF LOGO IS RECOGNIZED
        if(logoResponse.logoAnnotations){
            console.log('logo')
            logoResults = logoResponse.logoAnnotations
            searchTerm = logoResponse.logoAnnotations[0].description.toLowerCase();
            console.log('searchTerm: ' + searchTerm)

        //IF TEXT IS RECOGNIZED
        } else {
            console.log('text')
            logoResults = logoResponse.textAnnotations
            searchTermRaw = logoResults === undefined? 'Not Found' : logoResponse.textAnnotations[0].description;
            searchTerm = searchTermRaw.toLowerCase().replace(/\s/g,'')
            console.log('searchTerm: ' + searchTerm)
        }

        //KNEX SEARCHING LOGIC


        knex('companies').where('label', searchTerm).then(result => {

            if(result.length) {
                console.log(result)
                res.json(result);
            }
            else if(!result.length){
                console.log('text match not found, alias match execute')
                knex.from('companies').innerJoin('alias', 'alias.company_id', 'companies.id')
                .where('alias.label', searchTerm)
                .then(result1 => {
                    if(result1.length){
                        console.log(result1)
                        res.json(result1)
                    }
                    else if(!result1.length){
                        console.log('alias not found, partial match execute')
                        knex.from('companies')
                        .leftJoin('alias', 'alias.company_id', 'companies.id')
                        .where('companies.label', 'like', `%${searchTerm}%`)
                        .orWhere('alias.label', 'like', `%${searchTerm}%`)
                        .then(result2 => {
                            if(result2.length){
                                console.log(result2)

                                //FANCY REDUCE METHOD TO RID OF DUPLICATES BASED ON COMPANY_ID
                                
                                let answer = result2.reduce((accumulator, current) => {
                                    const found = accumulator.find(ele => {
                                      if(current.company_id === ele.company_id){
                                        return true;
                                      }
                                    })
                                      if (!found) {
                                          accumulator.push(current);
                                      }
                                      return accumulator;
                                  }, []);
                                  console.log(answer)
                                res.json(answer)
                            }
                            else{
                                console.log('nothing found :(')
                                reply = 'Nothing Found.'
                            }
                        })
                    }
                }) 
            }
        })


                })
        .catch(error => {
            console.log(error)
        })
})

app.listen( port, () => {
    console.log(`${port} is now active.`)
})
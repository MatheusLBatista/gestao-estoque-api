import app from './src/app.js'
import * as dotenv from 'dotenv'

const port = process.env.PORT || 5011; 

app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`)
  })
const http = require('http');
const fs = require('fs');
const {Client} = require('pg')          // Imports

const client = new Client({             // Set up client for connecting to the database
    user: '*******',
    host: '***********',
    database: 'cs130',
    password: '********',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();                       // Connect to database

function testTitle(t1){                     // Method to validate the 'title' field
  if(t1==="Mx"||t1==="Ms"||t1==="Mr"||t1==="Mrs"||t1==="Miss"||t1==="Dr"||t1==="Other"){
      return true;
  }
  else{
      console.log("Invalid Title!")
  }
  return false;
}

const createUser = (title, first_name, surname, mobile, email,              // Method to create and add a user tot he database
  home_address1, home_address2, home_town, home_county, home_eircode,
  ship_address1, ship_address2, ship_town, ship_county, ship_eircode) => {

  if (testTitle(title) === true) {                                          // Verify title


      const personalInfoQuery = {                                           // SQL query to add users details to the 'personal details' table in database
          text: `INSERT INTO personal_information                               
          (title, first_name, surname, mobile, email)
          VALUES
          ($1, $2, $3, $4, $5)`,
          values: [title, first_name, surname, mobile, email]
      };
      const homeAddressQuery = {                                     // SQL query to add users details to the 'home_address' table in database
          text: `INSERT INTO home_address   
          (address_line1, address_line2, town, county, eircode)
          VALUES
          ($1, $2, $3, $4, $5)`,
          values: [home_address1, home_address2, home_town, home_county, home_eircode]
      };
      const shipAddressQuery = {                                    // SQL query to add users details to the 'ship_address' table in database
          text: `INSERT INTO ship_address
          (address_line1, address_line2, town, county, eircode)
          VALUES
          ($1, $2, $3, $4, $5)`,
          values: [ship_address1, ship_address2, ship_town, ship_county, ship_eircode]
      };

      client.query(personalInfoQuery, (err)=>{                      // Run queries and catch any errors
          if(err){
              console.log("Error inserting personal info!");
              return;
          }
          else{
              console.log("Personal Added!")
          }
      });
      client.query(homeAddressQuery, (err)=>{               
          if(err){
              console.log("Error inserting home address!");
              return;
          }
          else{
              console.log("Home Added!")
          }
      });
      client.query(shipAddressQuery, (err)=>{
          if(err){
              console.log("Error inserting shipping address!");
          }
          else{
              console.log("Ship added!");
          }
      });
      console.log("New user added!");
  }
}

const getUser = (first_name, surname) => {                              // Method for retreiving users information from the database
  
  const getQuery = {
      text:   `SELECT * FROM personal_information WHERE first_name = $1 AND surname = $2`,
      values: [first_name, surname],
  };
  client.query(getQuery, (err, res)=>{
      if(err){
          console.log("Error retrieving user!");
      }
      if(res.rows.length === 0){
          console.log("User doesn't exist!");
      }
      else{
          console.log(res.rows);
      }
  })
}

const updateUser = (first_name, surname, mobile, email, title, home_address1, home_address2, home_town, home_county, home_eircode, 
  ship_address1, ship_address2, ship_town, ship_county, ship_eircode) => {         // Method for updating user details in database
  const getId = {
      text: `SELECT id FROM personal_information WHERE first_name = $1 AND surname = $2`,
      values: [first_name, surname],
  };

  client.query(getId, (err, res) => {                   // method takes in first_name and surname and gets unique ID
      if (err) {
          console.log("Error retrieving user!");
      }
      if (res.rows.length === 0) {
          console.log("User doesn't exist!");
      } else {
          let userId = res.rows[0].id;
          
          const updatePersonalQuery = {                 // Then uses that ID to update all corresponding rows in other tables
              text: `UPDATE personal_information SET mobile = $2, email = $3, title= $4 WHERE id = $1;`,
              values: [userId, mobile, email, title],
          };
          client.query(updatePersonalQuery, (err) => {          
              if (err) {
                  console.log("Error updating user!");
              } else {
                  console.log("User updated successfully!");
              }
          });

          const updateHomeQuery = {
              text: `UPDATE home_address SET address_line1 = $2, address_line2 = $3, town = $4, county = $5, eircode = $6 WHERE home_id = $1;`,
              values: [userId, home_address1, home_address2, home_town, home_county, home_eircode],
          };
          client.query(updateHomeQuery, (err) => {
              if(err){
                  console.log("Error updating home address!");
              }
              else{
                  console.log("Home address updated!");
              }
          })

          const shipUpdateQuery = {
              text: `UPDATE ship_address SET address_line1 = $2, address_line2 = $3, town = $4, county = $5, eircode = $6 WHERE ship_id = $1;`,
              values: [userId, ship_address1, ship_address2, ship_town, ship_county, ship_eircode],
          };
          client.query(shipUpdateQuery, (err) => {
              if(err){
                  console.log("Error updating shipping address!");
              }
              else{
                  console.log("Ship address updated!");
              }
          })
      }
  });
};

const deleteUser = (first_name, surname) => {                   // Method for deleting user from the database

  const getId = {
      text: `SELECT id FROM personal_information WHERE first_name = $1 AND surname = $2`,
      values: [first_name, surname],
  };

  client.query(getId, (err, res) => {
      if (err) {
          console.log("Error retrieving user!");
      }
      if (res.rows.length === 0) {
          console.log("User doesn't exist!");
      } else {
          let userId = res.rows[0].id;

          const deletePersonalQuery = {
              text: `DELETE FROM personal_information WHERE id = $1`,
              values: [userId],
          };
          client.query(deletePersonalQuery, (err) =>{
              if(err){
                  console.log("Error deleting user!");
              }
              else{
                  console.log("User deleted!");
              }
          });

          const deleteHomeQuery = {
              text: `DELETE FROM home_address WHERE home_id = $1`,
              values: [userId],
          };
          client.query(deleteHomeQuery, (err) => {
              if(err){
                  console.log("Error deleting home address!");
              }
              else{
                  console.log("Home address deleted!");
              }
          });

          const deleteShipQuery = {
              text: `DELETE FROM ship_address WHERE ship_id = $1`,
              values: [userId],
          };
          client.query(deleteShipQuery, (err) =>{
              if(err){
                  console.log("Error deleting shipping address!");
              }
              else{
                  console.log("Shipping address deleted!")
              }
          });
      }
  });
};

const displayDatabase = () => {                                 // Method to display full dataabse
  const displayQuery = `SELECT * FROM personal_information 
                      INNER JOIN home_address ON personal_information.id = home_address.home_id
                      INNER JOIN ship_address ON personal_information.id = ship_address.ship_id`;
  client.query(displayQuery, (err,res) => {
      if(err){
          console.log("Error trying to display database!");
      }
      else{
          const layout = res.rows;
          console.log(layout);
      }
  });
};

// displayDatabase();                                          

const server = http.createServer((req, res) => {                // create server

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5050');   // handle CORS issues
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

  if(req.url === '/adduser' && req.method === 'POST') {                 // if url sent by AJAX ends in /adduser and is a 'POST' request 
    let body = '';                                                      
    req.on('data', chunk => {                                           // Break down incoming data into strings
      body += chunk.toString();
    });
    
    req.on('end', () => {                                               // parse data into a JSON format 
      console.log(body); 
      const formData = JSON.parse(body);                                // take values from JSON and store them
      const { title, first_name, surname, mobile, email, 
      home_address1, home_address2, home_town, home_county, home_eircode, 
      ship_address1, ship_address2, ship_town, ship_county, ship_eircode } = formData;
      console.log(formData)

      createUser(title, first_name, surname, mobile, email,             // pass values as parameters into 'createUser' method
      home_address1, home_address2, home_town, home_county, home_eircode,
      ship_address1, ship_address2, ship_town, ship_county, ship_eircode);

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('POST request received');
    });

  } else if(req.url.startsWith('/getuser') && req.method === 'GET') {       // If url sent by AJAX starts with '/getUser' and is a 'GET' method
    const parsedUrl = url.parse(req.url, true);                             // Parse user first name and surname from url
    const queryObject = parsedUrl.query;
    const first_name = queryObject.first_name;
    const surname = queryObject.surname;                                    // Store names in vairables     
    
    getUser(first_name, surname);                                           // Pass in as parameters to getUser method

  }
 else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});


server.listen(8000, () => {                                                 // Tell server to listen on port 8080
  console.log('Server listening on port 8000');                             // Confirm server is listening
});



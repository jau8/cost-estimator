const http = require('http');

const makeRequest = (options, data, callback) => {
  const req = http.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      callback(null, res, responseBody);
    });
  });

  req.on('error', (e) => {
    callback(e);
  });

  if (data) {
    req.write(data);
  }
  req.end();
};

const addCustomer = (callback) => {
  const data = JSON.stringify({
    name: 'Test Customer',
    address: '123 Test St',
  });

  const options = {
    hostname: '127.0.0.1', 
    port: 5001, 
    path: '/onecrew-430904/us-central1/api/add-customer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  makeRequest(options, data, callback);
};

const getCustomers = (callback) => {
  const options = {
    hostname: '127.0.0.1', 
    port: 5001, 
    path: '/onecrew-430904/us-central1/api/customers',
    method: 'GET',
  };

  makeRequest(options, null, callback);
};

const updateCustomer = (customerId, callback) => {
  const data = JSON.stringify({
    customerId,
    customerData: {
      name: 'Updated Customer',
      address: '456 Updated St',
    },
  });

  const options = {
    hostname: '127.0.0.1', 
    port: 5001, 
    path: '/onecrew-430904/us-central1/api/update-customer',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  makeRequest(options, data, callback);
};

const deleteCustomer = (customerId, callback) => {
  const data = JSON.stringify({
    customerId,
  });

  const options = {
    hostname: '127.0.0.1', 
    port: 5001, 
    path: '/onecrew-430904/us-central1/api/delete-customer',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  makeRequest(options, data, callback);
};

const addEstimate = (customerId, callback) => {
  const data = JSON.stringify({
    customerId,
    estimate: {
      detailedItems: {
        labor: [
          { name: 'Digout', units: 3, time: 3, rate: 30, margin: 30 },
          { name: 'Paving', units: 4, time: 4, rate: 30, margin: 30 },
        ],
        materials: [
          { name: 'Asphalt', units: 100, rate: 75, margin: 20 },
          { name: 'Sealcoating', units: 10, rate: 35, margin: 20 },
        ],
        equipment: [
          { name: 'Bobcat', units: 3, time: 3, rate: 20, margin: 20 },
          { name: 'Trucks', units: 4, time: 4, rate: 50, margin: 20 },
          { name: 'Paver', units: 1, time: 1, rate: 700, margin: 20 },
        ],
      },
      totalCost: 10280,
      totalPrice: 12983,
      createdAt: new Date().toISOString(),
    },
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: '/onecrew-430904/us-central1/api/save-estimate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  makeRequest(options, data, callback);
};

const getEstimates = (customerId, callback) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: `/onecrew-430904/us-central1/api/estimates/${customerId}`,
    method: 'GET',
  };

  makeRequest(options, null, callback);
};

addCustomer((err, res, body) => {
  if (err) {
    return console.error('Error adding customer:', err);
  }

  console.log('Add Customer Response:', body);

  const customerId = JSON.parse(body).id;

  getCustomers((err, res, body) => {
    if (err) {
      return console.error('Error getting customers:', err);
    }

    console.log('Get Customers Response:', body);

    updateCustomer(customerId, (err, res, body) => {
      if (err) {
        return console.error('Error updating customer:', err);
      }

      console.log('Update Customer Response:', body);

      addEstimate(customerId, (err, res, body) => {
        if (err) {
          return console.error('Error adding estimate:', err);
        }

        console.log('Add Estimate Response:', body);

        getEstimates(customerId, (err, res, body) => {
          if (err) {
            return console.error('Error getting estimates:', err);
          }

          console.log('Get Estimates Response:', body);

          deleteCustomer(customerId, (err, res, body) => {
            if (err) {
              return console.error('Error deleting customer:', err);
            }

            console.log('Delete Customer Response:', body);

            getCustomers((err, res, body) => {
              if (err) {
                return console.error('Error getting customers after deletion:', err);
              }

              console.log('Get Customers After Deletion Response:', body);
            });
          });
        });
      });
    });
  });
});

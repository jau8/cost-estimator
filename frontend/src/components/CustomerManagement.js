import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, Container, Typography, Grid, Paper, Divider, IconButton, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState({ name: '', address: '' });
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://us-central1-onecrew-430904.cloudfunctions.net/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("There was an error fetching the customers!", error);
    }
  };

  const handleAddCustomer = async () => {
    try {
      const response = await axios.post('https://us-central1-onecrew-430904.cloudfunctions.net/api/add-customer', newCustomer);
      setCustomers([...customers, { id: response.data.id, ...newCustomer }]);
      setNewCustomer({ name: '', address: '' });
    } catch (error) {
      console.error("There was an error adding the customer!", error);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      await axios.put('https://us-central1-onecrew-430904.cloudfunctions.net/api/update-customer', { customerId: selectedCustomer.id, customerData: editCustomer });
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, ...editCustomer } : c));
      setSelectedCustomer(null);
      setEditCustomer({ name: '', address: '' });
    } catch (error) {
      console.error("There was an error updating the customer!", error);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete('https://us-central1-onecrew-430904.cloudfunctions.net/api/delete-customer', { data: { customerId } });
      setCustomers(customers.filter(c => c.id !== customerId));
    } catch (error) {
      console.error("There was an error deleting the customer!", error);
    }
  };

  const fetchEstimates = async (customerId) => {
    try {
      const response = await axios.get(`https://us-central1-onecrew-430904.cloudfunctions.net/api/estimates/${customerId}`);
      return response.data;
    } catch (error) {
      console.error("There was an error fetching the estimates!", error);
      return [];
    }
  };

  const handleExpandCustomer = async (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      const estimates = await fetchEstimates(customerId);
      setCustomers(customers.map(c => c.id === customerId ? { ...c, estimates } : c));
      setExpandedCustomer(customerId);
    }
  };

  return (
    <Container component={Paper} style={{ padding: '2em', marginTop: '2em' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Customer Management
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="New Customer Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="New Customer Address"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleAddCustomer} variant="contained" color="primary">
            Add Customer
          </Button>
        </Grid>
      </Grid>
      <Divider style={{ margin: '2em 0' }} />
      <Typography variant="h6" component="h3" gutterBottom>
        Edit or Delete Customer
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === e.target.value);
              setSelectedCustomer(customer);
              setEditCustomer({ name: customer.name, address: customer.address });
            }}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Name"
            value={editCustomer.name}
            onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Address"
            value={editCustomer.address}
            onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleUpdateCustomer} variant="contained" color="primary">
            Update Customer
          </Button>
        </Grid>
        {selectedCustomer && (
          <Grid item xs={12}>
            <Button onClick={() => handleDeleteCustomer(selectedCustomer.id)} variant="contained" color="secondary">
              Delete Customer
            </Button>
          </Grid>
        )}
      </Grid>
      <Divider style={{ margin: '2em 0' }} />
      <Typography variant="h6" component="h3" gutterBottom>
        Customer List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <React.Fragment key={customer.id}>
                <TableRow>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleExpandCustomer(customer.id)}>
                      {expandedCustomer === customer.id ? 'Collapse' : 'Expand'}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedCustomer === customer.id && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Collapse in={expandedCustomer === customer.id} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          <Typography variant="h6" gutterBottom component="div">
                            Estimates
                          </Typography>
                          <Table size="small" aria-label="estimates">
                            <TableHead>
                              <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Units</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Margin</TableCell>
                                <TableCell>Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {customer.estimates?.map((estimate, index) => (
                                <Box key={index} marginBottom={2}>
                                  <TableRow>
                                    <TableCell colSpan={8}>
                                      <strong>Estimate {index + 1}</strong>
                                    </TableCell>
                                  </TableRow>
                                  {Object.keys(estimate.detailedItems).map((type) =>
                                    estimate.detailedItems[type].map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{type}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.units}</TableCell>
                                        <TableCell>{item.time}</TableCell>
                                        <TableCell>{item.rate}</TableCell>
                                        <TableCell>{item.cost}</TableCell>
                                        <TableCell>{item.margin}</TableCell>
                                        <TableCell>{item.price}</TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                  <TableRow>
                                    <TableCell colSpan={4}><strong>Total Cost</strong></TableCell>
                                    <TableCell colSpan={4}>{estimate.totalCost}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4}><strong>Total Price</strong></TableCell>
                                    <TableCell colSpan={4}>{estimate.totalPrice}</TableCell>
                                  </TableRow>
                                </Box>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default CustomerManagement;

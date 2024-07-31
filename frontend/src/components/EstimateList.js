import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

function EstimateList() {
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get('https://us-central1-onecrew-430904.cloudfunctions.net/api/estimate');
        setEstimates(response.data);
      } catch (error) {
        console.error("There was an error fetching the estimates!", error);
      }
    };
    fetchEstimates();
  }, []);

  return (
    <Container component={Paper} style={{ padding: '2em', marginTop: '2em' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Estimate List
      </Typography>
      <List>
        {estimates.map((estimate) => (
          <ListItem key={estimate.id}>
            <ListItemText primary={`${estimate.item} - $${estimate.price.toFixed(2)}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default EstimateList;

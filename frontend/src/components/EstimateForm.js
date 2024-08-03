import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField, Button, Container, Typography, Grid, Paper, Divider, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Autocomplete, Collapse
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function EstimateForm() {
  const [laborItems, setLaborItems] = useState([{ name: "", units: 0, time: 0, rate: 0, margin: 0 }]);
  const [materialsItems, setMaterialsItems] = useState([{ name: "", units: 0, rate: 0, margin: 0 }]);
  const [equipmentItems, setEquipmentItems] = useState([{ name: "", units: 0, time: 0, rate: 0, margin: 0 }]);
  const [response, setResponse] = useState(null);
  const [requestPayload, setRequestPayload] = useState(null);
  const [errors, setErrors] = useState({ labor: [], materials: [], equipment: [] });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [expandedEstimate, setExpandedEstimate] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "customers"));
      const customerData = [];
      querySnapshot.forEach((doc) => {
        customerData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customerData);
    } catch (error) {
      console.error("There was an error fetching the customers!", error);
    }
  };

  const fetchEstimates = async (customerId) => {
    try {
      const response = await axios.get(`https://us-central1-onecrew-430904.cloudfunctions.net/api/estimates/${customerId}`);
      setEstimates(response.data);
    } catch (error) {
      console.error("There was an error fetching the estimates!", error);
    }
  };

  const handleChange = (index, type, event) => {
    const { name, value } = event.target;
    if (type === "Labor") {
      const items = [...laborItems];
      items[index][name] = value;
      setLaborItems(items);
    } else if (type === "Materials") {
      const items = [...materialsItems];
      items[index][name] = value;
      setMaterialsItems(items);
    } else if (type === "Equipment") {
      const items = [...equipmentItems];
      items[index][name] = value;
      setEquipmentItems(items);
    }
  };

  const handleAddItem = (type) => {
    if (type === "Labor") {
      setLaborItems([...laborItems, { name: "", units: 0, time: 0, rate: 0, margin: 0 }]);
      setErrors({ ...errors, labor: [...errors.labor, {}] });
    } else if (type === "Materials") {
      setMaterialsItems([...materialsItems, { name: "", units: 0, rate: 0, margin: 0 }]);
      setErrors({ ...errors, materials: [...errors.materials, {}] });
    } else if (type === "Equipment") {
      setEquipmentItems([...equipmentItems, { name: "", units: 0, time: 0, rate: 0, margin: 0 }]);
      setErrors({ ...errors, equipment: [...errors.equipment, {}] });
    }
  };

  const handleRemoveItem = (index, type) => {
    if (type === "Labor") {
      const items = [...laborItems];
      items.splice(index, 1);
      setLaborItems(items);
      const errorItems = [...errors.labor];
      errorItems.splice(index, 1);
      setErrors({ ...errors, labor: errorItems });
    } else if (type === "Materials") {
      const items = [...materialsItems];
      items.splice(index, 1);
      setMaterialsItems(items);
      const errorItems = [...errors.materials];
      errorItems.splice(index, 1);
      setErrors({ ...errors, materials: errorItems });
    } else if (type === "Equipment") {
      const items = [...equipmentItems];
      items.splice(index, 1);
      setEquipmentItems(items);
      const errorItems = [...errors.equipment];
      errorItems.splice(index, 1);
      setErrors({ ...errors, equipment: errorItems });
    }
  };

  const validateItems = (items, type) => {
    return items.map((item, index) => {
      const itemErrors = {};
      if (!item.name) itemErrors.name = true;
      if (item.rate <= 0) itemErrors.rate = true;
      if (item.margin < 0) itemErrors.margin = true;
      if (item.units <= 0) itemErrors.units = true;
      if (type !== "Materials" && item.time <= 0) itemErrors.time = true;
      return itemErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const laborErrors = validateItems(laborItems, "Labor");
    const materialsErrors = validateItems(materialsItems, "Materials");
    const equipmentErrors = validateItems(equipmentItems, "Equipment");

    if (
      laborErrors.some((item) => Object.keys(item).length) ||
      materialsErrors.some((item) => Object.keys(item).length) ||
      equipmentErrors.some((item) => Object.keys(item).length)
    ) {
      setErrors({ labor: laborErrors, materials: materialsErrors, equipment: equipmentErrors });
      alert("Please fill in all fields correctly.");
      return;
    }

    const items = [
      ...laborItems.map((item) => ({ type: "labor", ...item })),
      ...materialsItems.map((item) => ({ type: "materials", ...item })),
      ...equipmentItems.map((item) => ({ type: "equipment", ...item })),
    ];

    const payload = { items };
    setRequestPayload(payload);

    console.log("API Request Payload:", payload);

    try {
      const response = await axios.post("https://us-central1-onecrew-430904.cloudfunctions.net/api/estimate", payload);
      console.log("API Response:", response.data);
      setResponse(response.data);
    } catch (error) {
      console.error("There was an error submitting the form!", error);
    }
  };

  const handleSaveEstimate = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer to save the estimate.");
      return;
    }

    const estimate = {
      ...response,
      createdAt: new Date(),
    };

    const payload = { estimate, customerId: selectedCustomer.id };

    console.log("Save Estimate Payload:", payload);

    try {
      const saveResponse = await axios.post("https://us-central1-onecrew-430904.cloudfunctions.net/api/save-estimate", payload);
      console.log("Save Estimate Response:", saveResponse.data);
      alert("Estimate saved successfully!");
      fetchEstimates(selectedCustomer.id);
    } catch (error) {
      console.error("There was an error saving the estimate!", error);
    }
  };

  const handleDeleteEstimate = async (estimateId) => {
    if (!selectedCustomer) {
      alert("Please select a customer to delete the estimate.");
      return;
    }

    const payload = { customerId: selectedCustomer.id, estimateId };

    console.log("Delete Estimate Payload:", payload);

    try {
      const deleteResponse = await axios.delete("https://us-central1-onecrew-430904.cloudfunctions.net/api/delete-estimate", {
        data: payload,
      });
      console.log("Delete Estimate Response:", deleteResponse.data);
      alert("Estimate deleted successfully!");
      fetchEstimates(selectedCustomer.id);
    } catch (error) {
      console.error("There was an error deleting the estimate!", error);
    }
  };

  const renderItems = (items, type) => (
    items.map((item, index) => (
      <Grid container spacing={2} key={`${type}-${index}`} alignItems="center" style={{ marginBottom: "1em" }}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Item"
            name="name"
            value={item.name}
            onChange={(e) => handleChange(index, type, e)}
            error={errors[type.toLowerCase()][index]?.name || false}
            helperText={errors[type.toLowerCase()][index]?.name ? "Item is required" : ""}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Units"
            name="units"
            value={item.units}
            onChange={(e) => handleChange(index, type, e)}
            error={errors[type.toLowerCase()][index]?.units || false}
            helperText={errors[type.toLowerCase()][index]?.units ? "Units must be greater than 0" : ""}
          />
        </Grid>
        {type !== "Materials" && (
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="number"
              label="Time (hours)"
              name="time"
              value={item.time}
              onChange={(e) => handleChange(index, type, e)}
              error={errors[type.toLowerCase()][index]?.time || false}
              helperText={errors[type.toLowerCase()][index]?.time ? "Time must be greater than 0" : ""}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Rate"
            name="rate"
            value={item.rate}
            onChange={(e) => handleChange(index, type, e)}
            error={errors[type.toLowerCase()][index]?.rate || false}
            helperText={errors[type.toLowerCase()][index]?.rate ? "Rate must be greater than 0" : ""}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Margin (%)"
            name="margin"
            value={item.margin}
            onChange={(e) => handleChange(index, type, e)}
            error={errors[type.toLowerCase()][index]?.margin || false}
            helperText={errors[type.toLowerCase()][index]?.margin ? "Margin must be 0 or greater" : ""}
          />
        </Grid>
        <Grid item xs={12} sm={1}>
          <IconButton onClick={() => handleRemoveItem(index, type)} sx={{ backgroundColor: "#3a3a3a", color: "#fff", "&:hover": { backgroundColor: "#2a2a2a" } }}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    ))
  );

  const exportToPDF = (detailedItems, totalCost, totalPrice) => {
    const doc = new jsPDF();
    doc.text("Estimate Report", 14, 22);

    const head = [["Type", "Item", "Units", "Time", "Rate", "Cost", "Margin", "Price"]];
    const body = [];

    Object.keys(detailedItems).forEach((type) => {
      detailedItems[type].forEach((item) => {
        body.push([
          type.charAt(0).toUpperCase() + type.slice(1),
          item.name,
          item.units,
          item.time,
          `$${item.rate} / hr`,
          `$${item.cost}`,
          `${item.margin}%`,
          `$${item.price.toFixed(0)}`,
        ]);
      });
    });

    body.push([{ content: "Total", colSpan: 5, styles: { halign: "right" } }, `$${totalCost.toFixed(0)}`, `${((totalPrice - totalCost) / totalPrice) * 100}%`, `$${totalPrice.toFixed(0)}`]);

    doc.autoTable({
      head: head,
      body: body,
      startY: 30,
    });

    doc.save("estimate_report.pdf");
  };

  const exportToExcel = (detailedItems, totalCost, totalPrice) => {
    const wb = XLSX.utils.book_new();
    const ws_data = [["Type", "Item", "Units", "Time", "Rate", "Cost", "Margin", "Price"]];

    Object.keys(detailedItems).forEach((type) => {
      detailedItems[type].forEach((item) => {
        ws_data.push([
          type.charAt(0).toUpperCase() + type.slice(1),
          item.name,
          item.units,
          item.time,
          `$${item.rate} / hr`,
          `$${item.cost}`,
          `${item.margin}%`,
          `$${item.price.toFixed(0)}`,
        ]);
      });
    });

    ws_data.push(["Total", "", "", "", "", `$${totalCost.toFixed(0)}`, `${((totalPrice - totalCost) / totalPrice) * 100}%`, `$${totalPrice.toFixed(0)}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Estimate Report");
    XLSX.writeFile(wb, "estimate_report.xlsx");
  };

  const renderResponseTable = (response) => {
    if (!response) return null;
    const { detailedItems, totalCost, totalPrice } = response;

    return (
      <>
        <TableContainer component={Paper} style={{ marginTop: "2em" }}>
          <Table>
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
              {Object.keys(detailedItems).map((type) =>
                detailedItems[type].map((item, index) => (
                  <TableRow key={`${type}-${index}`}>
                    {index === 0 && (
                      <TableCell rowSpan={detailedItems[type].length} style={{ verticalAlign: "top" }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </TableCell>
                    )}
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{`$${item.rate} / hr`}</TableCell>
                    <TableCell>{`$${item.cost}`}</TableCell>
                    <TableCell>{`${item.margin}%`}</TableCell>
                    <TableCell>{`$${item.price.toFixed(0)}`}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={5} align="right">
                  <strong>Total</strong>
                </TableCell>
                <TableCell>
                  <strong>${totalCost.toFixed(0)}</strong>
                </TableCell>
                <TableCell>
                  <strong>{((totalPrice - totalCost) / totalPrice) * 100}%</strong>
                </TableCell>
                <TableCell>
                  <strong>${totalPrice.toFixed(0)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#3a3a5a", color: "#fff", "&:hover": { backgroundColor: "#3a3a7a" } }}
          onClick={() => exportToPDF(detailedItems, totalCost, totalPrice)}
          style={{ marginTop: "1em" }}
        >
          Export to PDF
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#3a3a5a", color: "#fff", "&:hover": { backgroundColor: "#3a3a7a" } }}
          onClick={() => exportToExcel(detailedItems, totalCost, totalPrice)}
          style={{ marginTop: "1em", marginLeft: "1em" }}
        >
          Export to Excel
        </Button>
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => option.name}
          value={selectedCustomer}
          onChange={(event, newValue) => {
            setSelectedCustomer(newValue);
            if (newValue) fetchEstimates(newValue.id);
          }}
          renderInput={(params) => <TextField {...params} label="Select Customer" variant="outlined" style={{ marginTop: "1em" }} />}
        />
        <Button variant="contained" sx={{ backgroundColor: "#3a3a5a", color: "#fff", "&:hover": { backgroundColor: "#3a3a7a" } }} onClick={handleSaveEstimate} style={{ marginTop: "1em" }}>
          Save Estimate
        </Button>
      </>
    );
  };

  const renderEstimatesTable = () => (
    <>
      {estimates.length > 0 && (
        <TableContainer component={Paper} style={{ marginTop: "2em" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estimate ID</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimates.map((estimate) => (
                <>
                  <TableRow key={estimate.id}>
                    <TableCell>{estimate.id}</TableCell>
                    <TableCell>${estimate.totalCost.toFixed(0)}</TableCell>
                    <TableCell>${estimate.totalPrice.toFixed(0)}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setExpandedEstimate(expandedEstimate === estimate.id ? null : estimate.id)}
                        sx={{ backgroundColor: "#3a3a5a", color: "#fff", "&:hover": { backgroundColor: "#3a3a7a" } }}
                      >
                        {expandedEstimate === estimate.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteEstimate(estimate.id)}
                        sx={{ backgroundColor: "#d32f2f", color: "#fff", "&:hover": { backgroundColor: "#9a0007" } }}
                        style={{ marginLeft: "1em" }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedEstimate === estimate.id && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Collapse in={expandedEstimate === estimate.id} timeout="auto" unmountOnExit>
                          <Table>
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
                              {Object.keys(estimate.detailedItems).map((type) =>
                                estimate.detailedItems[type].map((item, index) => (
                                  <TableRow key={`${type}-${index}`}>
                                    {index === 0 && (
                                      <TableCell rowSpan={estimate.detailedItems[type].length} style={{ verticalAlign: "top" }}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </TableCell>
                                    )}
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.units}</TableCell>
                                    <TableCell>{item.time}</TableCell>
                                    <TableCell>{`$${item.rate} / hr`}</TableCell>
                                    <TableCell>{`$${item.cost}`}</TableCell>
                                    <TableCell>{`${item.margin}%`}</TableCell>
                                    <TableCell>{`$${item.price.toFixed(0)}`}</TableCell>
                                  </TableRow>
                                ))
                              )}
                              <TableRow>
                                <TableCell colSpan={5} align="right">
                                  <strong>Total</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>${estimate.totalCost.toFixed(0)}</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>{((estimate.totalPrice - estimate.totalCost) / estimate.totalPrice) * 100}%</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>${estimate.totalPrice.toFixed(0)}</strong>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );

  return (
    <Container component={Paper} style={{ padding: "2em", marginTop: "2em" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" component="h3" gutterBottom>
          Labor
        </Typography>
        {renderItems(laborItems, "Labor")}
        <Button onClick={() => handleAddItem("Labor")} variant="contained" sx={{ backgroundColor: "#3a3a3a", color: "#fff", "&:hover": { backgroundColor: "#2a2a2a" } }} fullWidth>
          Add Labor Item
        </Button>
        <Divider style={{ margin: "2em 0" }} />
        <Typography variant="h6" component="h3" gutterBottom>
          Materials
        </Typography>
        {renderItems(materialsItems, "Materials")}
        <Button onClick={() => handleAddItem("Materials")} variant="contained" sx={{ backgroundColor: "#3a3a3a", color: "#fff", "&:hover": { backgroundColor: "#2a2a2a" } }} fullWidth>
          Add Materials Item
        </Button>
        <Divider style={{ margin: "2em 0" }} />
        <Typography variant="h6" component="h3" gutterBottom>
          Equipment
        </Typography>
        {renderItems(equipmentItems, "Equipment")}
        <Button onClick={() => handleAddItem("Equipment")} variant="contained" sx={{ backgroundColor: "#3a3a3a", color: "#fff", "&:hover": { backgroundColor: "#2a2a2a" } }} fullWidth>
          Add Equipment Item
        </Button>
        <Divider style={{ margin: "2em 0" }} />
        <Button type="submit" variant="contained" sx={{ backgroundColor: "#3a3a5a", color: "#fff", "&:hover": { backgroundColor: "#3a3a7a" } }} fullWidth>
          Submit Estimate
        </Button>
      </form>
      {renderResponseTable(response)}
      {renderEstimatesTable()}
    </Container>
  );
}

export default EstimateForm;

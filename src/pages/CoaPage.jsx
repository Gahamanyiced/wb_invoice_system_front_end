import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Typography, Paper } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightIcon from '@mui/icons-material/Flight';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import RootLayout from '../layouts/RootLayout';
import CoaTable from '../components/CoaTable';
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getAllGLAccounts,
  createGLAccount,
  updateGLAccount,
  deleteGLAccount,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllAircraftTypes,
  createAircraftType,
  updateAircraftType,
  deleteAircraftType,
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../features/coa/coaSlice';

// ==================== Tab Panel ====================
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </Box>
  );
}

// ==================== COA Tab Config ====================
const COA_TABS = [
  {
    label: 'Supplier Details',
    icon: <StorefrontIcon fontSize="small" />,
    stateKey: 'suppliers',
    getAll: getAllSuppliers,
    create: createSupplier,
    update: updateSupplier,
    del: deleteSupplier,
    subtitle: 'Manage supplier records used in invoices',
    fields: [
      { name: 'vendor_id', label: 'Vendor ID', required: true },
      { name: 'vendor_name', label: 'Vendor Name', required: true },
    ],
    columns: [
      { key: 'vendor_id', label: 'VENDOR ID' },
      { key: 'vendor_name', label: 'VENDOR NAME' },
    ],
    getLabel: (row) => `${row.vendor_id} - ${row.vendor_name}`,
  },
  {
    label: 'Cost Center',
    icon: <AccountTreeIcon fontSize="small" />,
    stateKey: 'costCenters',
    getAll: getAllCostCenters,
    create: createCostCenter,
    update: updateCostCenter,
    del: deleteCostCenter,
    subtitle: 'Manage cost centers used in GL line entries',
    fields: [
      { name: 'cc_code', label: 'Cost Center Code', required: true },
      { name: 'cc_description', label: 'Description', required: true },
    ],
    columns: [
      { key: 'cc_code', label: 'CODE' },
      { key: 'cc_description', label: 'DESCRIPTION' },
    ],
    getLabel: (row) => `${row.cc_code} - ${row.cc_description}`,
  },
  {
    label: 'GL Account',
    icon: <CodeIcon fontSize="small" />,
    stateKey: 'glAccounts',
    getAll: getAllGLAccounts,
    create: createGLAccount,
    update: updateGLAccount,
    del: deleteGLAccount,
    subtitle: 'Manage General Ledger accounts for accounting',
    fields: [
      { name: 'gl_code', label: 'GL Code', required: true },
      { name: 'gl_description', label: 'Description', required: true },
    ],
    columns: [
      { key: 'gl_code', label: 'CODE' },
      { key: 'gl_description', label: 'DESCRIPTION' },
    ],
    getLabel: (row) => `${row.gl_code} - ${row.gl_description}`,
  },
  {
    label: 'Location',
    icon: <LocationOnIcon fontSize="small" />,
    stateKey: 'locations',
    getAll: getAllLocations,
    create: createLocation,
    update: updateLocation,
    del: deleteLocation,
    subtitle: 'Manage location codes for cost allocation',
    fields: [
      { name: 'loc_code', label: 'Location Code', required: true },
      { name: 'loc_name', label: 'Location Name', required: true },
    ],
    columns: [
      { key: 'loc_code', label: 'CODE' },
      { key: 'loc_name', label: 'NAME' },
    ],
    getLabel: (row) => `${row.loc_code} - ${row.loc_name}`,
  },
  {
    label: 'Aircraft Type',
    icon: <FlightIcon fontSize="small" />,
    stateKey: 'aircraftTypes',
    getAll: getAllAircraftTypes,
    create: createAircraftType,
    update: updateAircraftType,
    del: deleteAircraftType,
    subtitle: 'Manage aircraft types for operational invoices',
    fields: [
      { name: 'code', label: 'Aircraft Code', required: true },
      { name: 'description', label: 'Description', required: true },
    ],
    columns: [
      { key: 'code', label: 'CODE' },
      { key: 'description', label: 'DESCRIPTION' },
    ],
    getLabel: (row) => `${row.code} - ${row.description}`,
  },
  {
    label: 'Route',
    icon: <AltRouteIcon fontSize="small" />,
    stateKey: 'routes',
    getAll: getAllRoutes,
    create: createRoute,
    update: updateRoute,
    del: deleteRoute,
    subtitle: 'Manage flight routes for invoice categorization',
    fields: [
      { name: 'code', label: 'Route Code', required: true },
      { name: 'description', label: 'Description', required: true },
    ],
    columns: [
      { key: 'code', label: 'CODE' },
      { key: 'description', label: 'DESCRIPTION' },
    ],
    getLabel: (row) => `${row.code} - ${row.description}`,
  },
];

// ==================== CoaPage ====================
function CoaPage({ defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync when navigating between COA sidebar links
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <RootLayout>
      <Box>
        <Typography variant="h5" fontWeight="bold" color="#00529B" mb={1}>
          Chart of Accounts (COA)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Manage reference data used across invoices and petty cash
        </Typography>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              backgroundColor: '#f5f8fc',
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                minHeight: 48,
                gap: 0.5,
              },
              '& .Mui-selected': {
                color: '#00529B !important',
                fontWeight: 700,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00529B',
              },
            }}
          >
            {COA_TABS.map((tab, i) => (
              <Tab
                key={i}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>

          {COA_TABS.map((tab, i) => (
            <TabPanel key={i} value={activeTab} index={i}>
              <Box sx={{ p: 3 }}>
                <CoaTable
                  title={tab.label}
                  subtitle={tab.subtitle}
                  stateKey={tab.stateKey}
                  fields={tab.fields}
                  columns={tab.columns}
                  getAll={tab.getAll}
                  create={tab.create}
                  update={tab.update}
                  del={tab.del}
                  getLabel={tab.getLabel}
                />
              </Box>
            </TabPanel>
          ))}
        </Paper>
      </Box>
    </RootLayout>
  );
}

export default CoaPage;

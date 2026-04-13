import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSuppliers,
  getAllCostCenters,
  getAllGLAccounts,
  getAllLocations,
  getAllAircraftTypes,
  getAllRoutes,
} from '../features/coa/coaSlice';

/**
 * useCOAData
 *
 * Returns excelData shape used across all components:
 * {
 *   suppliers:     [{ id, value, label, description }]
 *   costCenters:   [{ id, value, label, description }]
 *   glCodes:       [{ id, value, label, description }]
 *   locations:     [{ id, value, label, description }]
 *   aircraftTypes: [{ id, value, label, description }]
 *   routes:        [{ id, value, label, description }]
 * }
 *
 * `id`    — DB primary key, used when sending IDs in payloads
 *            and for invoice number uniqueness check (supplier_id)
 * `value` — the code string, used for display/lookup in view modals
 * `label` — "CODE - Description", shown in Autocomplete input field
 */
const useCOAData = ({ enabled = true } = {}) => {
  const dispatch = useDispatch();
  const {
    suppliers,
    costCenters,
    glAccounts,
    locations,
    aircraftTypes,
    routes,
    isLoading,
  } = useSelector((state) => state.coa);

  useEffect(() => {
    if (!enabled) return;
    // Only fetch if not already loaded — avoids repeated API calls
    if (!suppliers) dispatch(getAllSuppliers());
    if (!costCenters) dispatch(getAllCostCenters());
    if (!glAccounts) dispatch(getAllGLAccounts());
    if (!locations) dispatch(getAllLocations());
    if (!aircraftTypes) dispatch(getAllAircraftTypes());
    if (!routes) dispatch(getAllRoutes());
  }, [dispatch, enabled]);

  // id is included so components can send the DB primary key in payloads
  // (e.g. gl_code id, cost_center id, supplier_id for invoice number check)
  const toOptions = (results, valueKey, labelKey) =>
    (results || []).map((item) => ({
      id: item.id,
      value: String(item[valueKey]),
      label: `${item[valueKey]} - ${item[labelKey]}`,
      description: item[labelKey],
    }));

  const excelData = {
    suppliers: toOptions(
      suppliers?.results || (Array.isArray(suppliers) ? suppliers : []),
      'vendor_id',
      'vendor_name',
    ),
    costCenters: toOptions(
      costCenters?.results || (Array.isArray(costCenters) ? costCenters : []),
      'cc_code',
      'cc_description',
    ),
    glCodes: toOptions(
      glAccounts?.results || (Array.isArray(glAccounts) ? glAccounts : []),
      'gl_code',
      'gl_description',
    ),
    locations: toOptions(
      locations?.results || (Array.isArray(locations) ? locations : []),
      'loc_code',
      'loc_name',
    ),
    aircraftTypes: toOptions(
      aircraftTypes?.results ||
        (Array.isArray(aircraftTypes) ? aircraftTypes : []),
      'code',
      'description',
    ),
    routes: toOptions(
      routes?.results || (Array.isArray(routes) ? routes : []),
      'code',
      'description',
    ),
  };

  return { excelData, isLoading };
};

export default useCOAData;

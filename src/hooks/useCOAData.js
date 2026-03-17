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
 * Drop-in replacement for the old `loadExcelData` pattern.
 *
 * Returns the same `excelData` shape all components already use:
 * {
 *   suppliers:     [{ value, label }]  — vendor_id, "vendor_id - vendor_name"
 *   costCenters:   [{ value, label }]  — cc_code,   "cc_code - cc_description"
 *   glCodes:       [{ value, label }]  — gl_code,   "gl_code - gl_description"
 *   locations:     [{ value, label }]  — loc_code,  "loc_code - loc_name"
 *   aircraftTypes: [{ value, label }]  — code,      "code - description"
 *   routes:        [{ value, label }]  — code,      "code - description"
 * }
 *
 * Also returns `isLoading` so components can show a spinner if needed.
 *
 * Usage (replaces the loadExcelData useEffect):
 *
 *   const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });
 */
const useCOAData = ({ enabled = true } = {}) => {
  const dispatch = useDispatch();
  const { suppliers, costCenters, glAccounts, locations, aircraftTypes, routes, isLoading } =
    useSelector((state) => state.coa);

  useEffect(() => {
    if (!enabled) return;
    // Only fetch if not already loaded — avoids repeated API calls
    if (!suppliers) dispatch(getAllSuppliers({ page: 1 }));
    if (!costCenters) dispatch(getAllCostCenters({ page: 1 }));
    if (!glAccounts) dispatch(getAllGLAccounts({ page: 1 }));
    if (!locations) dispatch(getAllLocations({ page: 1 }));
    if (!aircraftTypes) dispatch(getAllAircraftTypes({ page: 1 }));
    if (!routes) dispatch(getAllRoutes({ page: 1 }));
  }, [dispatch, enabled]);

  // Build the same { value, label } shape the old Excel parsing produced
  const toOptions = (results, valueKey, labelKey) =>
    (results || []).map((item) => ({
      value: String(item[valueKey]),
      label: `${item[valueKey]} - ${item[labelKey]}`,
      description: item[labelKey],
    }));

  const excelData = {
    suppliers: toOptions(
      suppliers?.results || (Array.isArray(suppliers) ? suppliers : []),
      'vendor_id',
      'vendor_name'
    ),
    costCenters: toOptions(
      costCenters?.results || (Array.isArray(costCenters) ? costCenters : []),
      'cc_code',
      'cc_description'
    ),
    glCodes: toOptions(
      glAccounts?.results || (Array.isArray(glAccounts) ? glAccounts : []),
      'gl_code',
      'gl_description'
    ),
    locations: toOptions(
      locations?.results || (Array.isArray(locations) ? locations : []),
      'loc_code',
      'loc_name'
    ),
    aircraftTypes: toOptions(
      aircraftTypes?.results || (Array.isArray(aircraftTypes) ? aircraftTypes : []),
      'code',
      'description'
    ),
    routes: toOptions(
      routes?.results || (Array.isArray(routes) ? routes : []),
      'code',
      'description'
    ),
  };

  return { excelData, isLoading };
};

export default useCOAData;
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import invoiceDashboardReducer from '../features/dashboard/dashboardSlice';
import departmentReducer from '../features/department/departmentSlice';
import invoiceReducer from '../features/invoice/invoiceSlice';
import userReducer from '../features/user/userSlice';
import reportReducer from '../features/report/reportSlice';
import sectionReducer from '../features/section/sectionSlice';
import signingFlowReducer from '../features/signingFlow/signingFlowSlice';
import pettyCashReducer from '../features/pettyCash/pettyCashSlice';
import coaReducer from '../features/coa/coaSlice';
import delegationReducer from '../features/delegation/delegationSlice';

const reducer = {
  invoice: invoiceReducer,
  auth: authReducer,
  invoiceDashboard: invoiceDashboardReducer,
  department: departmentReducer,
  user: userReducer,
  section: sectionReducer,
  signingFlow: signingFlowReducer,
  report: reportReducer,
  pettyCash: pettyCashReducer,
  coa: coaReducer,
  delegation: delegationReducer,
};

export default configureStore({
  reducer,
});

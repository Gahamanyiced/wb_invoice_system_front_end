import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import invoiceDashboardReducer from '../features/dashboard/dashboardSlice';
import departmentReducer from '../features/department/departmentSlice';
import invoiceReducer from '../features/invoice/invoiceSlice';
import userReducer from '../features/user/userSlice';
import reportReducer from '../features/report/reportSlice';
import sectionReducer from '../features/section/sectionSlice';
import signingFlowReducer from '../features/signingFlow/signingFlowSlice';

const reducer = {
  invoice: invoiceReducer,
  auth: authReducer,
  invoiceDashboard: invoiceDashboardReducer,
  department: departmentReducer,
  user: userReducer,
  section: sectionReducer,
  signingFlow: signingFlowReducer,
  report: reportReducer,
};

export default configureStore({
  reducer,
});

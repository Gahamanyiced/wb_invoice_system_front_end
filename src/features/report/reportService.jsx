import http from '../../http-common';

const getInvoiceReport = async (id) => {
    const token = localStorage.getItem('token');
    const response = await http.get(`/invoice/generate_invoice_report/${id}/`, {
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getAllInvoiceReport = async () => {
    const token = localStorage.getItem('token');
    const response = await http.get('/invoice/all-invoice-report/', {
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

const getInvoiceToSignReport = async () => {
    const token = localStorage.getItem('token');
    const response = await http.get('/invoice/signer-invoice-report/', {
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

const getUserOwnedInvoiceReport = async () => {
    const token = localStorage.getItem('token');
    const response = await http.get('/invoice/user-invoice-report/',{
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

const reportService = {
    getInvoiceReport,
    getAllInvoiceReport,
    getInvoiceToSignReport,
    getUserOwnedInvoiceReport,
};

export default reportService;
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { checkInvoiceNumber } from '../features/invoice/invoiceSlice';

const useInvoiceNumberCheck = (supplierId = null, debounceMs = 600) => {
  const dispatch = useDispatch();
  // 'idle' | 'checking' | 'available' | 'taken'
  const [invoiceNumStatus, setInvoiceNumStatus] = useState('idle');
  const [invoiceNumMessage, setInvoiceNumMessage] = useState('');
  const debounceTimer = useRef(null);
  const lastChecked = useRef('');

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const checkInvoiceNum = useCallback(
    (value) => {
      clearTimeout(debounceTimer.current);

      if (!value || !value.trim()) {
        setInvoiceNumStatus('idle');
        setInvoiceNumMessage('');
        lastChecked.current = '';
        return;
      }

      if (value.trim() === lastChecked.current) return;

      setInvoiceNumStatus('checking');
      setInvoiceNumMessage('');

      debounceTimer.current = setTimeout(async () => {
        lastChecked.current = value.trim();
        try {
          const res = await dispatch(
            checkInvoiceNumber({
              invoice_number: value.trim(),
              supplier_id: supplierId || undefined,
            }),
          );

          if (res.meta.requestStatus === 'fulfilled') {
            // Backend returns { exists: true/false, message: "..." }
            const { exists, message } = res.payload;
            setInvoiceNumStatus(exists ? 'taken' : 'available');
            setInvoiceNumMessage(message || '');
          } else {
            setInvoiceNumStatus('idle');
            setInvoiceNumMessage('');
          }
        } catch {
          setInvoiceNumStatus('idle');
          setInvoiceNumMessage('');
        }
      }, debounceMs);
    },
    [dispatch, supplierId, debounceMs],
  );

  const resetInvoiceNumCheck = useCallback(() => {
    clearTimeout(debounceTimer.current);
    setInvoiceNumStatus('idle');
    setInvoiceNumMessage('');
    lastChecked.current = '';
  }, []);

  return {
    invoiceNumStatus,
    invoiceNumMessage,
    checkInvoiceNum,
    resetInvoiceNumCheck,
  };
};

export default useInvoiceNumberCheck;

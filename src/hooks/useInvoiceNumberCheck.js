import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { checkInvoiceNumber } from '../features/invoice/invoiceSlice';

/**
 * useInvoiceNumberCheck
 *
 * Debounced hook that calls GET /invoice/check-invoice-number/
 * whenever invoice_number changes (after 600ms idle).
 *
 * Usage:
 *   const { invoiceNumStatus, checkInvoiceNum } = useInvoiceNumberCheck(supplierId);
 *
 *   // In the input onChange / setValue callback:
 *   checkInvoiceNum(value);
 *
 *   // In the JSX:
 *   invoiceNumStatus === 'checking' → show spinner
 *   invoiceNumStatus === 'taken'    → show error helper text
 *   invoiceNumStatus === 'available'→ show green helper text
 *   invoiceNumStatus === null       → field is empty / untouched, show nothing
 *
 * @param {number|string|null} supplierId  — passed as supplier_id query param
 * @param {number} debounceMs             — debounce delay (default 600ms)
 */
const useInvoiceNumberCheck = (supplierId = null, debounceMs = 600) => {
  const dispatch = useDispatch();

  // 'idle' | 'checking' | 'available' | 'taken'
  const [invoiceNumStatus, setInvoiceNumStatus] = useState('idle');
  const debounceTimer = useRef(null);
  const lastChecked = useRef('');

  // Cancel any pending debounce on unmount
  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const checkInvoiceNum = useCallback(
    (value) => {
      clearTimeout(debounceTimer.current);

      // Reset to idle if field is cleared
      if (!value || !value.trim()) {
        setInvoiceNumStatus('idle');
        lastChecked.current = '';
        return;
      }

      // Skip re-check if the value hasn't changed
      if (value.trim() === lastChecked.current) return;

      setInvoiceNumStatus('checking');

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
            // Backend returns plain boolean: true = already used, false = available
            setInvoiceNumStatus(res.payload === true ? 'taken' : 'available');
          } else {
            // API error — don't block submission, just reset
            setInvoiceNumStatus('idle');
          }
        } catch {
          setInvoiceNumStatus('idle');
        }
      }, debounceMs);
    },
    [dispatch, supplierId, debounceMs],
  );

  // Reset when modal closes / supplier changes
  const resetInvoiceNumCheck = useCallback(() => {
    clearTimeout(debounceTimer.current);
    setInvoiceNumStatus('idle');
    lastChecked.current = '';
  }, []);

  return { invoiceNumStatus, checkInvoiceNum, resetInvoiceNumCheck };
};

export default useInvoiceNumberCheck;

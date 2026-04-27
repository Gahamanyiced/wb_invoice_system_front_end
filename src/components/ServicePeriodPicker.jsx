// src/components/ServicePeriodPicker.jsx
// ─── Booking.com-style dual-month calendar range picker ──────────────────────
// Single trigger field → popover with two side-by-side months.
// Click first date = start, click second = end. Range is highlighted between.
// Past dates are fully selectable (invoices can cover past periods).
// No MUI X, no date-fns, no extra dependencies.
//
// Responsive fixes:
//   • Popover Paper: overflow: 'auto', maxHeight: '90vh' — scrollable on short screens
//   • Calendar area: flexWrap: 'wrap' + minWidth on each month — stacks on narrow screens
//   • Header bar: position: 'sticky', top: 0 — stays visible while scrolling
//   • Footer: position: 'sticky', bottom: 0 — Apply button always visible

import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Popover,
  Typography,
  IconButton,
  InputAdornment,
  Button,
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toLocalDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toDateString = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const formatDisplay = (d) =>
  d
    ? d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

// ── Single month calendar ─────────────────────────────────────────────────────
function MonthCalendar({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDayClick,
  onDayHover,
  onDayLeave,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  // Effective range end — use hover preview when end not yet chosen
  const rangeEnd = endDate || hoverDate;

  const isStart = (d) => d && startDate && sameDay(d, startDate);
  const isEnd = (d) => d && endDate && sameDay(d, endDate);
  const isInRange = (d) => {
    if (!d || !startDate || !rangeEnd) return false;
    return d > startDate && d < rangeEnd;
  };
  const isHoverEnd = (d) => d && !endDate && hoverDate && sameDay(d, hoverDate);

  return (
    <Box sx={{ width: 280 }}>
      {/* Day-of-week headers */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}
      >
        {DAYS.map((d) => (
          <Typography
            key={d}
            variant="caption"
            sx={{
              textAlign: 'center',
              color: '#888',
              fontWeight: 600,
              py: 0.5,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Day cells */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d) return <Box key={`blank-${i}`} />;

          const start = isStart(d);
          const end = isEnd(d);
          const inRange = isInRange(d);
          const hovered = isHoverEnd(d);

          // Circle colour
          let bgcolor = 'transparent';
          let color = '#222';
          let fontWeight = 400;

          if (start || end) {
            bgcolor = '#00529B';
            color = 'white';
            fontWeight = 700;
          } else if (hovered && startDate && !endDate) {
            bgcolor = 'rgba(0, 82, 155, 0.15)';
            color = '#00529B';
            fontWeight = 600;
          }

          // Range strip behind the circle
          const showStrip = inRange;

          return (
            <Box
              key={i}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 36,
                // Continuous range background strip
                '&::before': showStrip
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: d.getDay() === 0 ? '50%' : 0,
                      right: d.getDay() === 6 ? '50%' : 0,
                      bgcolor: 'rgba(0, 82, 155, 0.1)',
                      zIndex: 0,
                    }
                  : {},
                // Half-strip to connect start/end circles to the range strip
                '&::after':
                  (start && endDate) || end
                    ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: end ? 0 : '50%',
                        right: start ? 0 : '50%',
                        bgcolor:
                          (start && !endDate) || (end && !startDate)
                            ? 'transparent'
                            : 'rgba(0, 82, 155, 0.1)',
                        zIndex: 0,
                      }
                    : {},
              }}
            >
              <Box
                onClick={() => onDayClick(d)}
                onMouseEnter={() => onDayHover(d)}
                onMouseLeave={onDayLeave}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  bgcolor,
                  color,
                  fontWeight,
                  fontSize: '0.875rem',
                  cursor: 'pointer', // all dates clickable, including past
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  '&:hover': {
                    bgcolor: start || end ? '#003a6d' : 'rgba(0, 82, 155, 0.2)',
                    color: start || end ? 'white' : '#00529B',
                  },
                }}
              >
                {d.getDate()}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Props:
 *   value      {string}  "YYYY-MM-DD to YYYY-MM-DD" or ''
 *   onChange   {fn}      called with combined string when range complete
 *   error      {bool}
 *   helperText {string}
 *   required   {bool}
 *   disabled   {bool}
 *   size       {string}
 */
export default function ServicePeriodPicker({
  value = '',
  onChange,
  error = false,
  helperText = '',
  required = false,
  disabled = false,
  size = 'small',
}) {
  const anchorRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);

  // Default left month to the current month
  const now = new Date();
  const [leftMonth, setLeftMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const rightMonth = {
    year: leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year,
    month: leftMonth.month === 11 ? 0 : leftMonth.month + 1,
  };

  // ── Parse stored value ────────────────────────────────────────────────────
  const parseValue = (v) => {
    if (v && v.includes(' to ')) {
      const [s, e] = v.split(' to ');
      return { start: toLocalDate(s.trim()), end: toLocalDate(e.trim()) };
    }
    return { start: null, end: null };
  };

  const openPicker = () => {
    if (disabled) return;
    const { start, end } = parseValue(value);
    setStartDate(start);
    setEndDate(end);
    setSelecting(false);
    setHoverDate(null);
    // Scroll the left panel to the start month if a range already exists
    if (start) {
      setLeftMonth({ year: start.getFullYear(), month: start.getMonth() });
    }
    setAnchorEl(anchorRef.current);
  };

  const closePicker = () => {
    setAnchorEl(null);
    setHoverDate(null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setSelecting(false);
    onChange('');
  };

  // ── Day interaction ───────────────────────────────────────────────────────
  const handleDayClick = (d) => {
    if (!selecting || !startDate) {
      // First click → set start
      setStartDate(d);
      setEndDate(null);
      setSelecting(true);
    } else {
      // Second click → set end (swap if needed)
      if (d < startDate) {
        setEndDate(startDate);
        setStartDate(d);
      } else {
        setEndDate(d);
      }
      setSelecting(false);
      setHoverDate(null);
    }
  };

  const handleDayHover = (d) => {
    if (selecting && startDate) setHoverDate(d);
  };

  const handleDayLeave = () => {
    if (selecting) setHoverDate(null);
  };

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = () => {
    if (startDate && endDate) {
      onChange(`${toDateString(startDate)} to ${toDateString(endDate)}`);
    }
    closePicker();
  };

  // ── Month navigation ──────────────────────────────────────────────────────
  const prevMonth = () =>
    setLeftMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );

  const nextMonth = () =>
    setLeftMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );

  // ── Display label ─────────────────────────────────────────────────────────
  const displayValue = (() => {
    const { start, end } = parseValue(value);
    if (start && end)
      return `${formatDisplay(start)}  →  ${formatDisplay(end)}`;
    return '';
  })();

  // ── Status line (inside the popover header) ───────────────────────────────
  const statusLine = (() => {
    if (!startDate) return 'Select start date';
    if (!endDate)
      return hoverDate
        ? `${formatDisplay(startDate)}  →  ${formatDisplay(hoverDate)}`
        : 'Now select end date';
    return `${formatDisplay(startDate)}  →  ${formatDisplay(endDate)}`;
  })();

  const canApply = Boolean(startDate && endDate);

  return (
    <>
      {/* ── Trigger field ───────────────────────────────────────────────── */}
      <TextField
        ref={anchorRef}
        label={required ? 'Service Period *' : 'Service Period'}
        value={displayValue}
        onClick={openPicker}
        error={error}
        helperText={helperText}
        disabled={disabled}
        size={size}
        fullWidth
        variant="outlined"
        placeholder="Select service period..."
        InputLabelProps={{ shrink: true }}
        inputProps={{
          readOnly: true,
          style: { cursor: disabled ? 'default' : 'pointer' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <DateRangeIcon
                sx={{
                  color: disabled ? 'action.disabled' : '#00529B',
                  fontSize: 20,
                }}
              />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                disabled={disabled}
                tabIndex={-1}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { cursor: disabled ? 'default' : 'pointer' },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            cursor: disabled ? 'default' : 'pointer',
            '&:hover fieldset': {
              borderColor: disabled ? undefined : '#00529B',
            },
          },
        }}
      />

      {/* ── Popover ─────────────────────────────────────────────────────── */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: 2,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            // ↓ FIX: scrollable on short screens — Paper scrolls instead of clipping
            overflow: 'auto',
            maxHeight: '90vh',
          },
        }}
      >
        {/* Header bar — sticky so it stays visible while scrolling */}
        <Box
          sx={{
            bgcolor: '#00529B',
            color: 'white',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // ↓ FIX: sticks to top of the scrollable Popover
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {statusLine}
          </Typography>
          <IconButton
            size="small"
            onClick={closePicker}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Calendar area */}
        <Box sx={{ p: 2.5 }}>
          {/* ↓ FIX: flexWrap so months stack vertically on narrow/short screens */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Left month */}
            <Box sx={{ minWidth: 280 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <IconButton size="small" onClick={prevMonth}>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ minWidth: 140, textAlign: 'center' }}
                >
                  {MONTHS[leftMonth.month]} {leftMonth.year}
                </Typography>
                {/* spacer so title stays centred */}
                <Box sx={{ width: 28 }} />
              </Box>
              <MonthCalendar
                year={leftMonth.year}
                month={leftMonth.month}
                startDate={startDate}
                endDate={endDate}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={handleDayHover}
                onDayLeave={handleDayLeave}
              />
            </Box>

            {/* Divider — hidden when stacked vertically */}
            <Box
              sx={{
                width: '1px',
                bgcolor: '#e0e0e0',
                mx: 0.5,
                display: { xs: 'none', sm: 'block' },
              }}
            />

            {/* Right month */}
            <Box sx={{ minWidth: 280 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Box sx={{ width: 28 }} />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ minWidth: 140, textAlign: 'center' }}
                >
                  {MONTHS[rightMonth.month]} {rightMonth.year}
                </Typography>
                <IconButton size="small" onClick={nextMonth}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              <MonthCalendar
                year={rightMonth.year}
                month={rightMonth.month}
                startDate={startDate}
                endDate={endDate}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={handleDayHover}
                onDayLeave={handleDayLeave}
              />
            </Box>
          </Box>

          {/* Footer — sticky so Apply is always visible without scrolling */}
          <Box
            sx={{
              mt: 2.5,
              pt: 2,
              pb: 0.5,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              // ↓ FIX: always visible at bottom of the scrollable Popover
              position: 'sticky',
              bottom: 0,
              bgcolor: '#fff',
              zIndex: 1,
            }}
          >
            <Button
              size="small"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelecting(false);
              }}
              sx={{ color: '#888', textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              disabled={!canApply}
              sx={{
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003a6d' },
                textTransform: 'none',
                px: 3,
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}

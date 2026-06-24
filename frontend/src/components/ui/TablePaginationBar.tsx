import { Box, Pagination, Typography } from '@mui/material';

interface TablePaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function TablePaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: TablePaginationBarProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = total === 0 ? 0 : (page - 1) * (pageSize || 0) + 1;
  const end = pageSize ? Math.min(page * pageSize, total) : total;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {total === 0
          ? '0 records'
          : pageSize
            ? `Showing ${start}-${end} of ${total} records`
            : `${total} total records · Page ${page} of ${safeTotalPages}`}
      </Typography>
      <Pagination
        count={safeTotalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        size="small"
        disabled={total === 0}
      />
    </Box>
  );
}

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
const data = [
  { name: '钱包新手营', users: 1280, conversion: 42 },
  { name: '链上任务', users: 920, conversion: 36 },
  { name: '邀请挑战', users: 2100, conversion: 65 },
  { name: '创意实验室', users: 740, conversion: 51 },
  { name: '开源贡献', users: 350, conversion: 78 },
  { name: '每日签到', users: 3200, conversion: 83 },
];
const columns = [
  { accessorKey: 'name', header: '活动' },
  { accessorKey: 'users', header: '参与人数' },
  { accessorKey: 'conversion', header: '转化率 %' },
];
export function DataTable() {
  const [sorting, setSorting] = useState<SortingState>([]),
    [filter, setFilter] = useState('');
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 3 } },
  });
  return (
    <>
      <label>
        筛选活动
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="活动名称" />
      </label>
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h) => (
                  <th
                    key={h.id}
                    aria-sort={
                      h.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : h.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <button onClick={h.column.getToggleSortingHandler()}>
                      {flexRender(h.column.columnDef.header, h.getContext())}{' '}
                      {h.column.getIsSorted() === 'asc'
                        ? '↑'
                        : h.column.getIsSorted() === 'desc'
                          ? '↓'
                          : '↕'}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!table.getRowModel().rows.length && <p>没有匹配活动</p>}
      </div>
      <div className="row">
        <button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
          上一页
        </button>
        <span>
          {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
        </span>
        <button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
          下一页
        </button>
      </div>
    </>
  );
}
export function ChartDemo() {
  return (
    <>
      <div className="chart" role="img" aria-label="演示数据：每日签到参与人数最多，为 3200 人">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 12, bottom: 10 }}>
            <defs>
              <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#29343c" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9cabba' }} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: '#9cabba' }} />
            <Tooltip
              contentStyle={{ background: '#16212a', borderColor: '#354550', color: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              name="参与人数"
              stroke="#a3e635"
              fill="url(#area-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p>固定演示数据；生产环境配合 TanStack Query 获取指标。</p>
    </>
  );
}

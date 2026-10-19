import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MAX_STAT } from '../pokemonDetail/detailConfig';

// Barras agrupadas horizontales. `data` = [{ stat, left, right }]: cada stat
// tiene 2 barras.
function CompareChart({ data, leftName, rightName }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        {/* Eje numérico normalizado al máximo de una stat (255), igual que en detalle. */}
        <XAxis type="number" domain={[0, MAX_STAT]} allowDecimals={false} />
        <YAxis type="category" dataKey="stat" width={78} />
        <Tooltip />
        <Legend />
        <Bar dataKey="left" name={leftName} fill="#5B8DEF" radius={[0, 6, 6, 0]} />
        <Bar dataKey="right" name={rightName} fill="#2E5AA8" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CompareChart;

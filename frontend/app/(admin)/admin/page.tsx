import { StatsOverview } from './_components/stats-overview';

export default function AdminDashboard() {
  return (
    <>
      <h1 className="display mb-6 text-4xl">Tổng quan</h1>
      <StatsOverview />
    </>
  );
}

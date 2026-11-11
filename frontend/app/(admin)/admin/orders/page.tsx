import { OrdersTable } from './_components/orders-table';

export default function AdminOrdersPage() {
  return (
    <>
      <h1 className="display mb-6 text-4xl">Đơn hàng</h1>
      <OrdersTable />
    </>
  );
}

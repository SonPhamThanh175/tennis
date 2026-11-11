'use client';

import { Alert, Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorBox } from '@/components/ui/states';
import { useAuth } from '@/providers/auth-provider';

interface Values {
  fullName?: string;
  email: string;
  phone?: string;
  password: string;
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  async function onFinish(v: Values) {
    setBusy(true);
    setError('');
    try {
      const user = isLogin
        ? await login(v.email.trim(), v.password)
        : await register({
            email: v.email.trim(),
            password: v.password,
            fullName: v.fullName!.trim(),
            phone: v.phone?.trim() || undefined,
          });
      router.push(user.role === 'ADMIN' ? '/admin' : '/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display mb-8 text-5xl">{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
      <Form<Values> layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
        {!isLogin && (
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input autoComplete="name" />
          </Form.Item>
        )}
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input autoComplete="email" />
        </Form.Item>
        {!isLogin && (
          <Form.Item name="phone" label="Số điện thoại">
            <Input autoComplete="tel" />
          </Form.Item>
        )}
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Nhập mật khẩu' },
            ...(isLogin ? [] : [{ min: 6, message: 'Tối thiểu 6 ký tự' }]),
          ]}
        >
          <Input.Password autoComplete={isLogin ? 'current-password' : 'new-password'} />
        </Form.Item>
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} />
          </div>
        )}
        <Button type="primary" htmlType="submit" block loading={busy}>
          {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
        </Button>
      </Form>
      <p className="mt-6 text-center text-sm text-neutral-500">
        {isLogin ? (
          <>Chưa có tài khoản? <Link href="/register" className="font-semibold text-brand">Đăng ký</Link></>
        ) : (
          <>Đã có tài khoản? <Link href="/login" className="font-semibold text-brand">Đăng nhập</Link></>
        )}
      </p>
      {isLogin && (
        <Alert
          className="mt-6"
          type="info"
          title="Tài khoản demo"
          description={
            <>
              Khách: khach@tennis.local / Customer@123
              <br />
              Admin: admin@tennis.local / Admin@123
            </>
          }
        />
      )}
    </div>
  );
}

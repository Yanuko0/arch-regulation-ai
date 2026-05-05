// app/page.tsx — 根路由重導向至 /zh-TW
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/zh-TW');
}

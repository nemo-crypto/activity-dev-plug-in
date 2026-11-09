import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { motion, useReducedMotion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Drawer } from 'vaul';
import { Command } from 'cmdk';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { QRCodeSVG } from 'qrcode.react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { openSupport } from '../lib/zendesk';
dayjs.extend(relativeTime); dayjs.locale('zh-cn');

export function Celebration() {
  const reduced = useReducedMotion();
  const [amount, setAmount] = useState(1280);
  const [now, setNow] = useState(Date.now());
  const [started] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => () => confetti.reset(), []);
  return <><div className="metric"><CountUp end={amount} preserveValue duration={reduced ? 0 : 1.2} separator=","/> <small>积分</small></div><p>活动开始于 {dayjs(started).from(dayjs(now))}</p><button onClick={() => { setAmount(v => v + 120); void confetti({ particleCount: 90, spread: 75, disableForReducedMotion: true }); }}>领取 120 演示积分</button></>;
}
const prizes = ['贴纸', '徽章', '积分', '明信片', '再接再厉', '头像'];
export function PrizeWheel() {
  const [rotation, setRotation] = useState(0), [result, setResult] = useState('点击转盘试试'), [busy, setBusy] = useState(false);
  const reduced = useReducedMotion();
  return <><div className="wheel-wrap"><span className="pointer">▼</span><motion.div className="wheel" animate={{ rotate: rotation }} transition={{ duration: reduced ? 0 : 2, ease: 'easeOut' }} onAnimationComplete={() => setBusy(false)}>{prizes.map((p, i) => <span key={p} style={{ transform: `rotate(${i * 60 + 30}deg) translateY(-72px) rotate(-${i * 60 + 30}deg)` }}>{p}</span>)}</motion.div></div><button disabled={busy} onClick={() => { const i = Math.floor(Math.random() * prizes.length); setBusy(!reduced); setRotation(r => Math.ceil(r / 360) * 360 + 1800 + 360 - (i * 60 + 30)); setResult(`本地演示：${prizes[i]}`); }}>转一次</button><p aria-live="polite">{busy ? '转动中…' : result}</p></>;
}
export function Overlays() {
  return <><Tabs.Root defaultValue="desktop"><Tabs.List aria-label="交互平台"><Tabs.Trigger value="desktop">PC 弹窗</Tabs.Trigger><Tabs.Trigger value="mobile">移动抽屉</Tabs.Trigger></Tabs.List><Tabs.Content value="desktop"><p>键盘 Escape 关闭，焦点自动返回触发按钮。</p><Dialog.Root><Dialog.Trigger asChild><button>打开活动规则</button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="overlay"/><Dialog.Content className="modal"><Dialog.Title>活动规则</Dialog.Title><Dialog.Description>这是 Radix Dialog 演示。活动积分仅保存在当前页面。</Dialog.Description><Dialog.Close asChild><button>知道了</button></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root></Tabs.Content><Tabs.Content value="mobile"><p>试试在手机上拖动底部面板。</p><Drawer.Root><Drawer.Trigger asChild><button>打开底部抽屉</button></Drawer.Trigger><Drawer.Portal><Drawer.Overlay className="overlay"/><Drawer.Content className="drawer"><div className="handle"/><Drawer.Title>选择参与方式</Drawer.Title><Drawer.Description>Vaul 支持触摸拖动，也可以通过按钮关闭。</Drawer.Description><Drawer.Close asChild><button>选择免费体验</button></Drawer.Close></Drawer.Content></Drawer.Portal></Drawer.Root></Tabs.Content></Tabs.Root></>;
}
const formSchema = z.object({ email: z.string().email('请输入有效邮箱'), name: z.string().trim().min(2, '昵称至少 2 个字符').max(24, '昵称最多 24 个字符'), accepted: z.boolean().refine(v => v, '请勾选演示条款') });
export function Signup() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { accepted: false } });
  return <form noValidate onSubmit={handleSubmit(v => { toast.success(`${v.name}，表单校验通过（未发送数据）`); reset(); })}><label>昵称<input {...register('name')} autoComplete="nickname" aria-invalid={!!errors.name} aria-describedby="name-error"/></label><span id="name-error" className="error">{errors.name?.message}</span><label>邮箱<input {...register('email')} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="email-error"/></label><span id="email-error" className="error">{errors.email?.message}</span><label className="check"><input type="checkbox" {...register('accepted')}/>同意演示条款</label><span className="error">{errors.accepted?.message}</span><button type="submit">校验报名信息</button></form>;
}
export function Notifications() {
  return <><Command label="组件快捷命令" className="command"><Command.Input placeholder="搜索操作…"/><Command.List><Command.Empty>没有匹配的操作</Command.Empty><Command.Item onSelect={() => toast.success('操作已完成')}>成功通知</Command.Item><Command.Item onSelect={() => toast.error('演示错误：请重试')}>错误通知</Command.Item><Command.Item onSelect={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: '正在处理本地任务…', success: '任务完成', error: '失败' })}>异步任务通知</Command.Item></Command.List></Command><p>输入关键词，用 ↑ ↓ 和 Enter 选择。</p></>;
}
export function AnimatedCards() {
  const [active, setActive] = useState('设计');
  const reduced = useReducedMotion();
  return <><div className="pills">{['设计', '开发', '发布'].map(item => <button key={item} aria-pressed={active === item} onClick={() => setActive(item)}>{active === item && <motion.span className="pill-bg" layoutId="active-pill" transition={{ duration: reduced ? 0 : .3 }}/>}<span>{item}</span></button>)}</div><motion.div className="animated-preview" key={active} initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><span>✦</span><h3>{active}你的下一次体验</h3><p>Motion 布局动画 + 系统减少动态效果偏好。</p></motion.div></>;
}
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}><button className="drag" {...attributes} {...listeners} aria-label={`拖动${id}`}>⠿</button>{id}</li>;
}
export function SortableDemo() {
  const [items, setItems] = useState(['钱包连接', '读取合约', '模拟交易', '签名确认']);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function reorder({ active, over }: DragEndEvent) { if (over && active.id !== over.id) setItems(v => arrayMove(v, v.indexOf(String(active.id)), v.indexOf(String(over.id)))); }
  return <><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}><SortableContext items={items} strategy={verticalListSortingStrategy}><ul className="sort-list">{items.map(id => <SortableItem key={id} id={id}/>)}</ul></SortableContext></DndContext><p>拖动把手排序；键盘聚焦把手后按空格，再用方向键移动。</p></>;
}
export function QrDemo() {
  const [value, setValue] = useState('https://github.com/nemo-crypto/activity-dev-plug-in');
  return <><label>二维码内容<input maxLength={400} value={value} onChange={e => setValue(e.target.value)}/></label><div className="qr">{value ? <QRCodeSVG value={value} size={144} marginSize={2} title="输入内容的二维码"/> : <p>输入内容生成二维码</p>}</div><p>普通内容二维码；钱包连接须使用 WalletConnect 会话 URI。</p></>;
}
export function Support() {
  const [status, setStatus] = useState('尚未加载第三方客服');
  return <><p>按需加载 Zendesk Messaging，避免首屏加载额外脚本。</p><button onClick={async () => { const key = import.meta.env.VITE_ZENDESK_KEY; if (!key) { setStatus('本地预览：你好，有什么可以帮助你？配置 widget key 后可打开真实客服。'); return; } setStatus('正在加载…'); try { await openSupport(key); setStatus('客服已打开'); } catch(e) { setStatus((e as Error).message); } }}>打开客服</button><p role="status">{status}</p></>;
}

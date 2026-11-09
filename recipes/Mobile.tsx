// 独立工程依赖：antd-mobile@5 swiper@11
import { Button, Form, Input, Popup, Toast, SafeArea } from 'antd-mobile';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Pagination, Keyboard } from 'swiper/modules';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
export default function App() {
  const [visible, setVisible] = useState(false);
  return (
    <main style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>周末活动</h1>
      <Swiper
        modules={[A11y, Pagination, Keyboard]}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{ 640: { slidesPerView: 2 } }}
      >
        {['创意工作坊', 'Web3 新手营', '开源见面会'].map((title) => (
          <SwiperSlide key={title}>
            <article style={{ padding: '40px 20px', background: '#e8f4dc', borderRadius: 16 }}>
              <h2>{title}</h2>
              <Button onClick={() => setVisible(true)}>报名</Button>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
        onClose={() => setVisible(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}
      >
        <h2>活动报名</h2>
        <Form
          onFinish={() => {
            Toast.show({ content: '本地校验通过，未上传数据' });
            setVisible(false);
          }}
          footer={
            <Button block type="submit" color="primary">
              提交报名
            </Button>
          }
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, whitespace: true, message: '请填写昵称' }]}
          >
            <Input placeholder="你的昵称" />
          </Form.Item>
        </Form>
        <Button block onClick={() => setVisible(false)}>
          取消
        </Button>
        <SafeArea position="bottom" />
      </Popup>
    </main>
  );
}

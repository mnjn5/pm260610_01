import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const slides = [
  {
    image: 'https://picsum.photos/seed/company1/1920/1080',
    badge: '혁신적인 기술',
    title: '더 나은 미래를\n함께 만들어갑니다',
    desc: '최첨단 기술과 전문 인력으로 고객의 비즈니스 성장을 지원합니다.',
  },
  {
    image: 'https://picsum.photos/seed/company2/1920/1080',
    badge: '신뢰할 수 있는 파트너',
    title: '고객과 함께\n성장하는 기업',
    desc: '20년간 쌓아온 노하우로 최적의 비즈니스 환경을 제공합니다.',
  },
  {
    image: 'https://picsum.photos/seed/company3/1920/1080',
    badge: '글로벌 경쟁력',
    title: '세계를 무대로\n도전합니다',
    desc: '글로벌 네트워크를 기반으로 해외 시장 진출을 함께 지원합니다.',
  },
]

export default function HeroSection() {
  return (
    <section className="-mx-5 md:-mx-10 -mt-8 h-screen relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        style={{ height: '100%' }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} style={{ height: '100%' }}>
            {/* 배경 이미지 */}
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/50" />
            {/* 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="mx-auto max-w-2xl px-6 text-center text-white">
                <span className="inline-block rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  {slide.badge}
                </span>
                <h1 className="mt-4 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-5 text-base text-white/80 md:text-xl">
                  {slide.desc}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/products"
                    className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                  >
                    제품 보기
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-full border border-white/60 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    문의하기
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

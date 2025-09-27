// app/page.tsx - Next.js용 랜딩페이지
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // 부드러운 스크롤
    const handleAnchorClick = (e: Event) => {
    const target = e.target as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href?.startsWith('#')) {
        e.preventDefault();
        const targetId = href.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        }
    }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // 스크롤 애니메이션
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 숫자 카운트 애니메이션
    const animateNumbers = () => {
      const stats = document.querySelectorAll('.stat-number');
      
      stats.forEach(stat => {
        const targetAttr = stat.getAttribute('data-target');
        const target = targetAttr ? parseInt(targetAttr) : 0;
        const increment = target / 60;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = Math.floor(current).toString();
        }, 50);
      });
    };

    // 통계 섹션 관찰
    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          animateNumbers();
          statsAnimated = true;
        }
      });
    }, { threshold: 0.5 });

    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    // 헤더 스크롤 효과
    let lastScrollTop = 0;
    const header = document.querySelector('.header') as HTMLElement;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);

    // 페이지 로드 완료 애니메이션
    document.body.classList.add('loaded');

    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (statsSection) {
        statsObserver.unobserve(statsSection);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="header-content max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#" className="flex items-center">
            <div className="Logo"><Image src="/Logo.png" alt="로고" width={70} height={50} style={{ width: 'auto', height: 'auto' }}/>
            </div>
          </Link>
          <nav className="header-nav hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-blue-700 transition-colors">기능</Link>
            <Link href="#demo" className="text-gray-700 hover:text-blue-700 transition-colors">미리보기</Link>
            <Link href="#benefits" className="text-gray-700 hover:text-blue-700 transition-colors">혜택</Link>
            <Link href="/" className="download-btn bg-blue-700 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors">바로가기</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-bg absolute inset-0"></div>
        <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="hero-badge inline-block bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full px-6 py-2 text-sm text-gray-700 mb-6">
            부담을 덜고, 온전한 나를 채우다
          </div>
          <h1 className="hero-title text-1xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-900 to-blue-300 bg-clip-text text-transparent">
            청년 맞춤형 여행 플랫폼
            <Image src="/Logo.png" alt="로고" width={350} height={100}  className="-ml-5"style={{ width: 'auto', height: 'auto' }}/>
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 mb-4">청년들을 위한 특별한 로컬 여행의 시작</p>
          <p className="hero-description text-gray-500 mb-12 max-w-2xl mx-auto">
            AI가 제안하는 특별한 여정,<br />
            청년 혜택과 로컬딜로 더 스마트하게.
          </p>
          <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="cta-primary bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
              ✨ 서비스 체험하기
            </Link>
            <Link href="#features" className="cta-secondary border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors">
              📖 더 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="section-header fade-in text-center mb-16">
            <div className="section-badge inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              일정 생성 · 관리
            </div>
            <h2 className="section-title text-4xl font-bold mb-6">
              나만의 여행 일정,<br />간편해졌어요
            </h2>
            <p className="section-subtitle text-lg text-gray-600 max-w-3xl mx-auto">
              여행을 한눈에, 그리고 한 번에!<br />
              다른 곳에서는 할 수 없었던 일이 로컬 체험 지도에서는 가능해요.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "AI 맞춤 코스 추천",
                description: "사용자의 취향과 데이터를 분석하여 개인 맞춤형 여행 코스를 추천합니다. 특색있는 숨겨진 로컬 스팟을 우선적으로 추천해드려요."
              },
              {
                icon: "💰",
                title: "실시간 로컬딜 정보",
                description: "청년 문화패스, KTX 할인, 지역화폐 등 청년들에게 실질적으로 도움이 되는 모든 혜택 정보를 한 곳에서 확인하세요."
              },
              {
                icon: "🗺️",
                title: "인터랙티브 지도",
                description: "체험, 문화공간, 맛집을 지도에서 한눈에 확인하고 북마크할 수 있습니다. 현재 위치 기준으로 가까운 스팟을 쉽게 찾아보세요."
              },
              {
                icon: "📱",
                title: "모바일 최적화",
                description: "393×852 모바일 화면에 최적화된 UI로 언제 어디서나 편리하게 로컬 정보를 확인하고 여행을 계획할 수 있습니다."
              },
              {
                icon: "🔖",
                title: "개인화된 북마크",
                description: "관심있는 스팟을 북마크하고 나만의 여행 리스트를 만들어보세요. 친구들과 공유도 가능합니다."
              },
              {
                icon: "🏃‍♂️",
                title: "청년 맞춤 서비스",
                description: "26세 남성, 취준생, 자취족 등 청년들의 니즈에 특화된 여행 정보와 할인 혜택을 우선적으로 제공합니다."
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card fade-in bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="feature-icon text-4xl mb-4">{feature.icon}</div>
                <h3 className="feature-title text-xl font-bold mb-4">{feature.title}</h3>
                <p className="feature-description text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo-section py-20 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="demo-container flex flex-col lg:flex-row items-center gap-16">
            <div className="demo-content fade-in flex-1">
              <div className="section-badge inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                어떤 취향이든, 다 맞춰주니까
              </div>
              <h2 className="demo-title text-4xl font-bold mb-6">
                어떤 여행 취향이든<br />간단히 알려주세요
              </h2>
              <p className="demo-description text-lg text-gray-600 mb-8">
                AI는 여러분의 취향에 꼭 맞는 일정을 추천해 드립니다. 
                여행 전이든 여행 중이든 내가 계획한 일정을 간편하게 수정하고 꺼내보세요.
              </p>
              <ul className="feature-list space-y-3">
                {["자연과 함께 여유롭게 힐링", "체험·액티비티 중심", "유명 관광지 필수 코스", "맛집 탐방 위주"].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="phone-mockup fade-in flex-1 max-w-md">
              <div className="phone-screen bg-white rounded-3xl p-6 shadow-2xl border-8 border-gray-800">
                <div className="screen-header text-center mb-6">
                  <h3 className="text-lg font-bold">🗺️ 로컬 지도</h3>
                </div>
                <div className="screen-content">
                  <div className="map-area relative bg-gray-100 rounded-lg h-48 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200"></div>
                    <div className="map-pin pin-1 absolute top-4 left-8 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="map-pin pin-2 absolute top-12 right-12 w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                    <div className="map-pin pin-3 absolute bottom-8 left-12 w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="spot-card bg-blue-50 p-3 rounded-lg">
                      <div className="spot-name font-medium text-sm">📍 서울 성수동 카페거리</div>
                      <div className="spot-discount text-blue-600 text-xs">청년 문화패스 20% 할인</div>
                    </div>
                    <div className="spot-card bg-purple-50 p-3 rounded-lg">
                      <div className="spot-name font-medium text-sm">🎨 홍대 예술공간</div>
                      <div className="spot-discount text-purple-600 text-xs">지역화폐 10% 추가 적립</div>
                    </div>
                  </div>
                </div>
                <div className="bottom-nav mt-6 flex justify-between text-xs">
                  {[
                    { icon: "🗺️", label: "지도", active: true },
                    { icon: "📋", label: "리스트" },
                    { icon: "🔖", label: "북마크" },
                    { icon: "👤", label: "마이" }
                  ].map((nav, index) => (
                    <div key={index} className={`nav-item text-center py-2 px-3 rounded ${nav.active ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                      <div>{nav.icon}</div>
                      <div>{nav.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="section-header fade-in text-center mb-16">
            <div className="section-badge inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              여행지 정보
            </div>
            <h2 className="section-title text-4xl font-bold mb-6">
              내가 가려는 그곳,<br />지금 상황 어떤가요?
            </h2>
            <p className="section-subtitle text-lg text-gray-600 max-w-3xl mx-auto">
              여행 중에도 내가 여행하는 곳의 유용한 정보와 현지<br />
              상황을 다른 여행자들과 공유해 보세요.
            </p>
          </div>

          <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 500, label: "등록된 로컬 스팟" },
              { number: 50, label: "실시간 할인 정보" },
              { number: 1000, label: "AI 추천 코스" },
              { number: 98, label: "사용자 만족도 (%)" }
            ].map((stat, index) => (
              <div key={index} className="stat-item fade-in text-center">
                <span className="stat-number text-4xl lg:text-5xl font-bold text-blue-600 block mb-2" data-target={stat.number}>
                  0
                </span>
                <div className="stat-label text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section py-20 bg-blue-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="section-header fade-in text-center mb-16">
            <div className="section-badge inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              여행 혜택
            </div>
            <h2 className="section-title text-4xl font-bold mb-6">
              더 저렴하게<br />여행 갈 수 있을까요?
            </h2>
            <p className="section-subtitle text-lg text-gray-600">
              로컬 체험 지도로 여행하면 이런 혜택이 있어요
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎁",
                title: "신규 가입 선물",
                description: "숙소, 투어·티켓 30만 쿠폰팩을 드려요. 지금 바로 가입하고 혜택을 받아보세요."
              },
              {
                icon: "💎",
                title: "로컬 캐시 적립",
                description: "예약, 프로모션 참여 시 현금처럼 쓸 수 있는 로컬 캐시를 지급해드립니다."
              },
              {
                icon: "🏆",
                title: "여행자 클럽 등급별 혜택",
                description: "여행에 활용 가능한 다양한 혜택을 제공합니다. 등급이 올라갈수록 더 많은 혜택을 받으세요."
              },
              {
                icon: "🎫",
                title: "매달 도착하는 할인 쿠폰",
                description: "여행자 클럽 전용으로 매달 숙소, 투어·티켓 할인 쿠폰이 자동으로 지급됩니다."
              },
              {
                icon: "📶",
                title: "전 세계 데이터 무료",
                description: "예약 완료 시 전 세계 데이터 5일 무료를 증정합니다. 해외여행에서 걱정 없이 사용하세요."
              },
              {
                icon: "🛡️",
                title: "여행자 보험 할인",
                description: "로컬 체험 지도 여행자를 위한 여행자 보험을 최대 10% 할인 혜택으로 제공합니다."
              }
            ].map((benefit, index) => (
              <div key={index} className="feature-card fade-in bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="feature-icon text-4xl mb-4">{benefit.icon}</div>
                <h3 className="feature-title text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="feature-description text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="fade-in">
            <h2 className="cta-title text-4xl md:text-5xl font-bold mb-6">
              나를 아는 여행 앱<br />로컬 체험 지도
            </h2>
            <p className="cta-subtitle text-xl mb-12">지금 바로 다운로드하고 여행을 떠나세요!</p>
            
            <div className="app-badges flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="#" className="app-badge bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-colors">
                📱 앱 다운로드
              </Link>
              <Link href="#" className="app-badge bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
                🌐 웹에서 체험하기
              </Link>
            </div>

            <p className="text-white/80">
              iOS 14.0 이상, Android 8.0 이상 지원
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-900 text-white py-16">
        <div className="footer-content max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="footer-section">
            <h3 className="text-xl font-bold mb-4">🗺️ 로컬 체험 지도</h3>
            <p className="text-gray-400 mb-4">청년들을 위한 특별한 로컬 여행 서비스</p>
            <p className="text-gray-500 text-sm">Next.js + Supabase로 구현</p>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">서비스 소개</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">AI 추천 시스템</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">로컬 스팟 등록</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">혜택 정보</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">고객지원</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">자주 묻는 질문</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">고객센터</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">개발자 문의</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">파트너십</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">약관 및 정책</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">이용약관</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">위치정보 이용약관</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">청소년보호정책</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 로컬 체험 지도 프로젝트. All rights reserved.</p>
          <p className="mt-2 text-sm">
            본 서비스는 일부 상품에 대해 통신판매중개자로서 통신판매의 당사자가 아니므로, 상품의 예약, 이용 및 환불 등에 대한 의무와 책임은 각 판매자에게 있습니다.
          </p>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header {
          transition: transform 0.3s ease;
        }

        body.loaded .hero-content {
          opacity: 1;
          transition: opacity 1s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in,
          .animate-pulse {
            animation: none;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

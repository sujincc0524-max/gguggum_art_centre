/* Exhibition data for gguggum art centre.
   category: "ongoing" | "past" | "collab"
   Add new items to the top of the relevant category — index.html shows the
   first 4 of "past" and first 4 of "collab" automatically; the view-all
   pages (past-exhibitions.html / collaborations.html) render every item.
   Each item's "href" points at the shared exhibition-detail.html?id=...
   template, which renders the "detail" object below (sub/date + either
   "blocks" — an array of short info blocks like Artist Talk schedules —
   or "body" — one long-form description). */

window.ggExhibitions = [
  {
    id: "docking",
    category: "ongoing",
    titleKo: "도킹 플랫폼 : 자리찾기",
    titleEn: "Docking Platform : Where We Dock",
    dateLabel: "2026.09.22 (Tue) ~ 2026.10.11(Sun)",
    subLabel: "꾸꿈아트센터 글로벌 아트 프로젝트",
    image: "img/poster_docking.png",
    href: "exhibition-detail.html?id=docking",
    detail: {
      titleEn: "Docking Platform : Where We Dock",
      sub: "꾸꿈아트센터 글로벌 아트 프로젝트",
      date: "2026.08.25 ~2026.09.13",
      body: "Artist Talk\n08.28 (fri) 17:00\n권민주\n송석우\n원예찬\n장동욱\n홍지혜\n\nArtist Talk\n10.02 (fri) 17:00\n서동신\n강호\n심윤\n이지영"
    }
  },
  {
    id: "window",
    category: "past",
    titleKo: "내가 본 창",
    dateLabel: "2024.11.07 ~ 2025.03.08",
    image: "img/poster_window.png",
    href: "exhibition-detail.html?id=window",
    detail: {
      sub: "앤솔로지: 구본창의 사진책\n- 기억의 아카이브",
      date: "2025.11.07 ~2026.02.08",
      body: "Through the Window I Saw\nAnthology: Koo Bohnchang's Photobooks – Archives of Memory\n\n- 오프닝 리셉션: 2025년 11월 07일 금요일 오후 6시\n- 작가와의 만남 & 북 사인회: 2025년 11월 08일 토요일 오후 2시\n\n* 전시 연계 프로그램\n\n- 2025년 12월 19일 (금) 오후 6시-7시\n- 신라금관 촬영 에피소드 & 북 사인회\n\n- 2026년 02월 11일 수요일 오후 4시\n- 북 토크 & 사인회: 꾸꿈아트센터\n대구광역시 중구 봉산문화길 29-2"
    }
  },
  {
    id: "picobox",
    category: "past",
    titleKo: "락하고, 점프! 마음껏 해라",
    dateLabel: "2025.08.29 ~ 2026.09.06",
    image: "img/poster_picobox.png",
    href: "exhibition-detail.html?id=picobox",
    detail: {
      sub: "PICOBOX FILM & TALK",
      date: "2025.08.29 ~2026.09.06",
      body: "< 꾸꿈아트센터에서 열리는 한여름 영화제 '피코박스 단편영화제'>\n\n- 채지희 감독\n《점핑클럽》\n\n- 성광제 감독\n《오락가락도 락이다》\n\n- 신명준 작가\n《돌을 찾아서》\n\n[ GV (관객과의 대화): Talk After Take ]\n일시: 2025년 08월 29일(금) 오후 6시 15분\n참석: 채지희 감독, 성광제 감독, 신명준 작가, 김서후 배우, 유예린 배우\n진행: 꾸꿈아트센터 2층 아트스페이스\n\n감독과 배우가 들려주는 영화 제작 비하인드 시간. 인상 깊었던 장면과 촬영 과정, 가장 어려웠던 순간과 가장 잊고 싶지 않은 에피소드, 그리고 앞으로의 계획까지 직접 들을 수 있는 자리입니다.\n\n[ Live Opening Set ]\n싱어송라이터 킴쿨 KEEMCOOL\n어쿠스틱 사운드를 기반으로 고유의 음악 세계를 확장해 나가고 있는 싱어송라이터\n\nABOUT PICOBOX\n'피코박스(PICOBOX)'는 이탈리아어 'Piccolo(작은, 어린)'에서 영감을 받아 만들어졌습니다. '세상에서 가장 작은 상자(어둠상자)'에서 피어나는 찬란한 빛, 그것이 피코박스가 전하는 이야기입니다."
    }
  },
  {
    id: "absence",
    category: "past",
    titleKo: "MOMENTS OF ABSENCE",
    dateLabel: "2025.5.16 ~ 2025.08.10",
    image: "img/poster_absence.png",
    href: "exhibition-detail.html?id=absence",
    detail: {
      sub: "도큐먼트 : 부재의 시간",
      date: "2025.05.16 ~2025.08.10",
      body: "개관프리뷰 두 번째 기획\n\n'도큐먼트: 부재의 시간'\nMoments of Absence\n\n흔들리는 것은 어둠이 아니라,\n찬란한 빛을 맞서는 두려움이었다.\n\n전시: 2025년 05월 10일 - 08월 10일.\n\n박진영, 이재갑\nArea Park, Lee Jae Gab\n\n독립적이고 자유로운 동시대 문화예술 공간\n꾸꿈아트센터\n\n대구광역시 중구 봉산문화길 29-2"
    }
  },
  {
    id: "myprops",
    category: "past",
    titleKo: "나의 보물 - MY PROPS",
    dateLabel: "2024.12.03 ~ 2025.02.16",
    image: "img/poster_myprops.png",
    href: "exhibition-detail.html?id=myprops",
    detail: {
      sub: "흔들리는 것은 바람이 아니었다. 마음이었다.",
      date: "2024.12.03 ~2025.02.16",
      body: "개관프리뷰 첫 번째 기획\n\n'나의 보물 - My Props'\n\n흔들리는 것은 바람이 아니었다,\n마음이었다.\n\n전시: 2024년 12월 03일 - 2025년 02월 16일.\n\n김재경, 변카카, 신준민, 이지영, 전리해 작가의 회화, 설치, 사진 작품\n을 소개한다.\n\n독립적이고 자유로운 동시대 문화예술 공간\n꾸꿈아트센터\n\n대구광역시 중구 봉산문화길 29-2"
    }
  },
  {
    id: "youth",
    category: "collab",
    titleKo: "청년예술백과 공오삼",
    dateLabel: "2026.07.21 ~ 2026.08.02",
    image: "img/poster_youth.png",
    href: "exhibition-detail.html?id=youth",
    detail: {
      sub: "대구 청년 작가 40인, 전시로 만나다",
      date: "2026.07.21 ~2026.08.02",
      body: "대구 청년 작가 40인의 포트폴리오를 한자리에… 지역 예술 생태계를\n잇는 '매칭 플랫폼'\n\n전시기획: 김민정\n\n주최: 한국문화예술위원회, 대구문화예술진흥원\n주관: ARTMAN, 이응\n후원: 꾸꿈아트센터"
    }
  }
];

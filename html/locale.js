const LOCALE_SRC = {
  "zh-CN": {
    lang: "语言",
    gyroscope: "陀螺仪",
    mute: "静音",
    magic: "自动",
    weibo: "微博",
    image: "绘",
    program: "程序",
    date: "约会",
    home: "首页",
  },
  "en-US": {
    lang: "Language",
    gyroscope: "Gyroscope",
    mute: "Mute",
    magic: "Auto",
    weibo: "Weibo",
    image: "Image",
    program: "Program",
    date: "Date",
    home: "Home",
  },
  "ja-JP": {
    lang: "言語",
    gyroscope: "水準器",
    mute: "静音",
    magic: "自動",
    weibo: "微博",
    image: "絵",
    program: "開発",
    date: "デート",
    home: "ホーム",
  },
};
const AVAIL_LANGS = Object.keys(LOCALE_SRC).sort();

const locale = {
  get: () => {
    let lang = "zh-CN";
    let paramLang = new URLSearchParams(location.search).get("lang");
    if (paramLang) {
      paramLang = paramLang.replace("_", "-");
    }
    if (AVAIL_LANGS.includes(paramLang)) {
      lang = paramLang;
    }
    return { lang, data: LOCALE_SRC[lang] };
  },
  set: (lang) => {
    const search = new URLSearchParams(location.search);
    search.set("lang", lang);
    window.history.replaceState(null, null, `?${search.toString()}`);
    refreshLocale();
  },
};

const refreshLocale = () => {
  const localeNodes = document.querySelectorAll("[data-locale]");
  const localeList = locale.get().data;
  localeNodes.forEach((node) => {
    const key = node.getAttribute("data-locale");
    const value = localeList[key];
    node.textContent = value;
  });
};
refreshLocale();

const switchLocale = () => {
  const curLang = locale.get().lang;
  const curLangIdx = AVAIL_LANGS.findIndex((v) => v === curLang);
  let nextLangIdx = curLangIdx + 1;
  if (nextLangIdx === AVAIL_LANGS.length) {
    nextLangIdx = 0;
  }
  locale.set(AVAIL_LANGS[nextLangIdx]);
};

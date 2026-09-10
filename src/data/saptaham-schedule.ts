export interface SaptahamDay {
  day: number;
  name: string; // e.g. "ഒന്നാം ദിവസം"
  title: string; // e.g. "വരാഹാവതാരവും കർദ്ദമ ചരിതവും"
  description: string;
  startSkandam: number;
  startChapter: number;
  endSkandam: number;
  endChapter: number;
  highlights: string[];
}

export const SAPTAHAM_SCHEDULE: SaptahamDay[] = [
  {
    day: 1,
    name: "ഒന്നാം ദിവസം",
    title: "ഭാഗവത മാഹാത്മ്യവും വരാഹാവതാരവും",
    description: "പ്രഥമ സ്കന്ധം മുഴുവനും, ദ്വിതീയ സ്കന്ധവും, തൃതീയ സ്കന്ധത്തിൽ ഹിരണ്യാക്ഷ വധം (അദ്ധ്യായം 19) വരെ.",
    startSkandam: 1,
    startChapter: 1,
    endSkandam: 3,
    endChapter: 19,
    highlights: ["ശൗനക ചോദ്യങ്ങൾ", "ഭീഷ്മസ്തുതി", "പരീക്ഷിത്ത് ശുക സംവാദം", "വരാഹാവതാരം", "ഹിരണ്യാക്ഷ വധം"],
  },
  {
    day: 2,
    name: "രണ്ടാം ദിവസം",
    title: "കപിലോപദേശവും ധ്രുവ-പൃഥു ചരിതങ്ങളും",
    description: "തൃതീയ സ്കന്ധം 20-ാം അദ്ധ്യായം മുതൽ ചതുർത്ഥ സ്കന്ധം പൂർണ്ണമായി (അദ്ധ്യായം 31 വരെ).",
    startSkandam: 3,
    startChapter: 20,
    endSkandam: 4,
    endChapter: 31,
    highlights: ["കപിലോപദേശം", "ദക്ഷയാഗം", "ധ്രുവന്റെ തപസ്സും മോക്ഷവും", "പൃഥുചരിതം", "പുരഞ്ജനോപാഖ്യാനം"],
  },
  {
    day: 3,
    name: "മൂന്നാം ദിവസം",
    title: "ഋഷഭദേവ ചരിതവും അജാമിള മോക്ഷവും",
    description: "പഞ്ചമ സ്കന്ധം മുഴുവനും, ഷഷ്ഠ സ്കന്ധം മുഴുവനും (അദ്ധ്യായം 26 വരെ).",
    startSkandam: 5,
    startChapter: 1,
    endSkandam: 6,
    endChapter: 26,
    highlights: ["ഋഷഭദേവൻ", "ജഡഭരതൻ", "ഭൂഗോളവർണ്ണന", "അജാമിള മോക്ഷം", "നാരായണകവചം", "വൃത്രാസുരവധം"],
  },
  {
    day: 4,
    name: "നാലാം ദിവസം",
    title: "നരസിംഹാവതാരവും വാമനാവതാരവും",
    description: "സപ്തമ സ്കന്ധം മുഴുവനും, അഷ്ടമ സ്കന്ധം മുഴുവനും (അദ്ധ്യായം 24 വരെ).",
    startSkandam: 7,
    startChapter: 1,
    endSkandam: 8,
    endChapter: 24,
    highlights: ["പ്രഹ്ലാദചരിതം", "നരസിംഹാവതാരം", "ഗജേന്ദ്രമോക്ഷം", "പാലാഴിമഥനം", "വാമനാവതാരം", "മത്സ്യാവതാരം"],
  },
  {
    day: 5,
    name: "അഞ്ചാം ദിവസം",
    title: "ശ്രീരാമാവതാരവും ശ്രീകൃഷ്ണ ജനനവും ബാലലീലകളും",
    description: "നവമ സ്കന്ധം മുഴുവനും, ദശമ സ്കന്ധത്തിൽ കംസവധം (അദ്ധ്യായം 44) വരെ.",
    startSkandam: 9,
    startChapter: 1,
    endSkandam: 10,
    endChapter: 44,
    highlights: ["അംബരീഷചരിതം", "ശ്രീരാമാവതാരം", "ശ്രീകൃഷ്ണാവതാരം", "പൂതനാമോക്ഷം", "ദാമോദരലീല", "ഗോവർദ്ധനോദ്ധാരണം", "കംസവധം"],
  },
  {
    day: 6,
    name: "ആറാം ദിവസം",
    title: "രാസലീലയും ദ്വാരകാലീലകളും കുചേലവൃത്താന്തവും",
    description: "ദശമ സ്കന്ധം 45-ാം അദ്ധ്യായം മുതൽ 90-ാം അദ്ധ്യായം വരെ.",
    startSkandam: 10,
    startChapter: 45,
    endSkandam: 10,
    endChapter: 90,
    highlights: ["ഉദ്ധവദൂത്", "രുക്മിണീ കല്യാണം", "ശ്യമന്തകം", "നരകാസുരവധം", "കുചേലസംഗമം", "വേദസ്തുതി"],
  },
  {
    day: 7,
    name: "ഏഴാം ദിവസം",
    title: "ഉദ്ധവഗീതയും പരീക്ഷിത്ത് മോക്ഷവും മഹാസമാപ്തിയും",
    description: "ഏകാദശ സ്കന്ധവും ദ്വാദശ സ്കന്ധവും മുഴുവനും (ഭാഗവത സമാപ്തി).",
    startSkandam: 11,
    startChapter: 1,
    endSkandam: 12,
    endChapter: 13,
    highlights: ["അവധൂതന്റെ 24 ഗുരുക്കന്മാർ", "ഉദ്ധവഗീത", "സ്വധാമപ്രവേശം", "കലിയുഗവർണ്ണന", "പരീക്ഷിത് മോക്ഷം", "ഭാഗവത സമാപ്തി"],
  },
];

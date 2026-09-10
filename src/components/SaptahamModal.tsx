'use client';

import React from 'react';
import Link from 'next/link';
import { SAPTAHAM_SCHEDULE } from '@/data/saptaham-schedule';
import { X, Calendar, ChevronRight } from 'lucide-react';

interface SaptahamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaptahamModal({ isOpen, onClose }: SaptahamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-devotional-card border border-devotional rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-devotional flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-devotional-accent" />
            <div>
              <h3 className="font-bold text-devotional-primary text-base">
                ഭാഗവത സപ്താഹ പാരായണ ക്രമം
              </h3>
              <p className="text-[11px] text-devotional-secondary">
                7 ദിവസങ്ങളിലായി ഭാഗവതം പൂർത്തിയാക്കുവാനുള്ള പരമ്പരാഗത ക്രമം
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-devotional-secondary hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {SAPTAHAM_SCHEDULE.map((item) => (
            <div
              key={item.day}
              className="p-3.5 rounded-xl bg-devotional-main border border-devotional hover:border-devotional-accent/60 transition"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-devotional-accent text-white font-bold text-xs">
                  {item.name}
                </span>
                <span className="text-[11px] text-devotional-secondary font-semibold">
                  സ്കന്ധം {item.startSkandam} അദ്ധ്യായം {item.startChapter} ➔ സ്കന്ധം {item.endSkandam} അദ്ധ്യായം {item.endChapter}
                </span>
              </div>

              <h4 className="font-bold text-devotional-primary text-sm">
                {item.title}
              </h4>

              <p className="text-xs text-devotional-secondary mt-1 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                {item.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-black/5 text-devotional-secondary px-2 py-0.5 rounded-md font-medium"
                  >
                    • {h}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-end">
                <Link
                  href={`/skandam/${item.startSkandam}/chapter/${item.startChapter}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-bold text-devotional-accent hover:underline active:scale-95"
                >
                  <span>ഈ ദിവസത്തെ വായന തുടങ്ങുക</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-devotional text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-black/5 text-devotional-primary font-semibold text-xs hover:bg-black/10"
          >
            അടയ്ക്കുക
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

// Phát âm bằng TTS của trình duyệt (spec mục 4: không dùng audio thu sẵn).
// Danh sách giọng tải bất đồng bộ (sự kiện voiceschanged), nên đọc qua useSyncExternalStore.

import { useCallback, useSyncExternalStore } from "react";

const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

function findJapaneseVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
}

function subscribe(onChange: () => void) {
  if (!hasSpeech()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/** Trả về tên giọng (chuỗi) để snapshot ổn định giữa các lần gọi */
const getSnapshot = () => (hasSpeech() ? (findJapaneseVoice()?.voiceURI ?? "") : "");
const getServerSnapshot = () => "";

export function useJapaneseSpeech() {
  const voiceUri = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const speak = useCallback(
    (text: string) => {
      if (!hasSpeech() || !voiceUri) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.voice = synth.getVoices().find((v) => v.voiceURI === voiceUri) ?? null;
      utterance.rate = 0.9;
      synth.speak(utterance);
    },
    [voiceUri],
  );

  return { canSpeak: voiceUri !== "", speak };
}

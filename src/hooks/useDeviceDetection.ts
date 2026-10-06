"use client";

import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  orientation: "portrait" | "landscape";
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    screenWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
    screenHeight: typeof window !== "undefined" ? window.innerHeight : 800,
    isTouchDevice: false,
    orientation: "landscape",
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch =
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

      const isMob = width < 768;
      const isTab = width >= 768 && width < 1024;
      const isDesk = width >= 1024;

      const type: DeviceType = isMob ? "mobile" : isTab ? "tablet" : "desktop";

      setDeviceInfo({
        isMobile: isMob,
        isTablet: isTab,
        isDesktop: isDesk,
        deviceType: type,
        screenWidth: width,
        screenHeight: height,
        isTouchDevice: !!isTouch,
        orientation: width > height ? "landscape" : "portrait",
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

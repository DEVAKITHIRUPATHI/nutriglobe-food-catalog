import * as React from "react"

const BREAKPOINTS = {
  SMALL: 480,   // Small mobile devices
  MEDIUM: 768,  // Tablets and larger mobile devices
  LARGE: 1024,  // Larger tablets and smaller laptops
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isSmallMobile, setIsSmallMobile] = React.useState<boolean>(false);
  const [isMediumMobile, setIsMediumMobile] = React.useState<boolean>(false);
  const [isLargeMobile, setIsLargeMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MEDIUM);
      setIsSmallMobile(window.innerWidth < BREAKPOINTS.SMALL);
      setIsMediumMobile(window.innerWidth >= BREAKPOINTS.SMALL && window.innerWidth < BREAKPOINTS.MEDIUM);
      setIsLargeMobile(window.innerWidth >= BREAKPOINTS.MEDIUM && window.innerWidth < BREAKPOINTS.LARGE);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile, isSmallMobile, isMediumMobile, isLargeMobile
  };
}

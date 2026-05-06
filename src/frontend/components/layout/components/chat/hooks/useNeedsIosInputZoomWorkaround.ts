import * as React from "react";

const getNeedsIosInputZoomWorkaround = () => {
    if (typeof navigator === "undefined") {
        return false;
    }

    const userAgent = navigator.userAgent ?? "";

    return (
        /iPad|iPhone|iPod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
};

const useNeedsIosInputZoomWorkaround = () => {
    return React.useMemo(() => {
        return getNeedsIosInputZoomWorkaround();
    }, []);
};

export default useNeedsIosInputZoomWorkaround;

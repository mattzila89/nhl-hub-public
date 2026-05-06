import MobileNav from "../navbar/MobileNav";
import NavBar from "../navbar/NavBar";

type NavigationProps = {
    theaterMode: boolean;
};

const Navigation = ({ theaterMode }: NavigationProps) => {
    if (theaterMode) {
        return null;
    }

    return (
        <>
            <NavBar />
            <MobileNav />
        </>
    );
};

export default Navigation;

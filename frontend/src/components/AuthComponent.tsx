import { Navbar, Footer } from "."

type AuthComponentOptions = {
    show: Boolean,
    children: React.ReactNode
}
const AuthComponent = ({ show, children }: AuthComponentOptions) => {
    return (
        <>
            {show && <Navbar />}
            {children}
            {show && <Footer />}
        </>
    )
}

export default AuthComponent;
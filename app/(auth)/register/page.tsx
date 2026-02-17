import RegistrationForm from "@/components/auth/registration-form";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Create An Account",
};



const RegisterPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-fit font-inter">
            <RegistrationForm />
        </div>
    );
}
 
export default RegisterPage;

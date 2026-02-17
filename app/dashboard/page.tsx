import { redirect } from "next/navigation";

const LegacyDashboardRedirect = () => {
  redirect("/user/dashboard");
};

export default LegacyDashboardRedirect;

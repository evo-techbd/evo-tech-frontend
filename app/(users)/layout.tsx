import { ReactNode } from "react";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  return children;
};

export default UserLayout;


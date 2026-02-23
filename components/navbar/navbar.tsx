import { StaticImageData } from "next/image";
import NavbarClient from "./navbar_client";

import ThreeDPrintService from "@/public/assets/services/3d-printing.png";
import LaserEngravingService from "@/public/assets/services/laser-engraving.png";
import ThesisWritingService from "@/public/assets/services/thesis-writing.png";
import ProjectDevService from "@/public/assets/services/capstone-project-dev.png";
import WebAppDevService from "@/public/assets/services/web-n-app-dev.png";

import AssistanceHub from "@/public/assets/support/customer-service.png";
import WarrantyPolicy from "@/public/assets/support/warranty-policy.png";
import StudentDiscount from "@/public/assets/support/student-discount.png";
import ShopShapeTomorrow from "@/public/assets/support/better-earth.png";
import ContactUs from "@/public/assets/support/contact-us.png";

export type NavbarMenuType1 = {
  gotourl: string;
  imgsrc: string | StaticImageData;
  name: string;
};

const NavBar = () => {
  // Static services data (not taxonomy-dependent)
  const services: NavbarMenuType1[] = [
    {
      gotourl: "/3d-printing",
      imgsrc: ThreeDPrintService,
      name: "3D Printing",
    },
    {
      gotourl: "/services/laser-engraving",
      imgsrc: LaserEngravingService,
      name: "Laser Engraving",
    },
    {
      gotourl: "/services/thesis-writing",
      imgsrc: ThesisWritingService,
      name: "Thesis Writing",
    },
    {
      gotourl: "/services/project-development",
      imgsrc: ProjectDevService,
      name: "Project Development",
    },
    {
      gotourl: "/services/web-and-app-development",
      imgsrc: WebAppDevService,
      name: "Web & App Development",
    },
  ];

  // Static support data (not taxonomy-dependent)
  const support: NavbarMenuType1[] = [
    { gotourl: "/support", imgsrc: AssistanceHub, name: "Assistance Hub" },
    {
      gotourl: "/about/warranty-policy",
      imgsrc: WarrantyPolicy,
      name: "Warranty Policy",
    },
    {
      gotourl: "/about/student-discount",
      imgsrc: StudentDiscount,
      name: "Student Discount",
    },
    {
      gotourl: "/about/shop-shape-tomorrow",
      imgsrc: ShopShapeTomorrow,
      name: "Shop & Shape Tomorrow",
    },
    { gotourl: "/support/contact", imgsrc: ContactUs, name: "Contact Us" },
  ];

  return (
    <>
      <NavbarClient services={services} support={support} />
    </>
  );
};

export default NavBar;

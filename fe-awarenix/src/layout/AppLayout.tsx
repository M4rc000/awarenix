import { useLocation } from "react-router";
import { Outlet } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { GridIcon, UserIcon, MailIcon, CalenderIcon } from "../icons";
import { FaUserCog } from "react-icons/fa";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import { useSidebar, SidebarProvider } from "../context/SidebarContext";
import { CgWebsite } from "react-icons/cg";
import { IoIosBookmarks } from "react-icons/io";
import { JSX } from "react";
import { IoSettingsOutline } from "react-icons/io5";

const breadcrumbMap: Record<string, { menu: string; title: string; icon: JSX.Element }> = {
  "/dashboard": { menu: "Admin", title: "Dashboard", icon: <GridIcon /> },
  "/campaigns": { menu: "Admin", title: "Campaigns", icon: <CalenderIcon /> },
  "/role-management": { menu: "Admin", title: "Role Management", icon: <FaUserCog size={20}/> },
  "/user-management": { menu: "Admin", title: "User Management", icon: <UserIcon /> },
  "/groups-members": { menu: "Admin", title: "Groups and Members", icon: <UserIcon /> },
  "/email-templates": { menu: "Admin", title: "Email Templates", icon: <MailIcon /> },
  "/sending-profiles": { menu: "Admin", title: "Sending Profiles", icon: <MailIcon /> },
  "/landing-pages": { menu: "Admin", title: "Landing Pages", icon: <GridIcon /> },
  "/phishing-emails": { menu: "Phishing Simulation & Training Modules", title: "Phishing Emails", icon: <MailIcon /> },
  "/phishing-websites": { menu: "Phishing Simulation & Training Modules", title: "Phishing Websites", icon: <CgWebsite /> },
  "/training-modules": { menu: "Phishing Simulation & Training Modules", title: "Training Modules", icon: <IoIosBookmarks /> },
  "/account-settings": { menu: "User", title: "Account Settings", icon: <IoSettingsOutline /> },
};

const LayoutContent: React.FC = () => {
  const { pathname } = useLocation();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const breadcrumb = breadcrumbMap[pathname];

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {breadcrumb && (
            <PageBreadcrumb
              menu={breadcrumb.menu}
              icon={breadcrumb.icon}
              pageTitle={breadcrumb.title}
            />
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};


const AppLayout: React.FC = () => {
  // const isAuthenticated = localStorage.getItem('token'); // atau dari context/state

  // return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;